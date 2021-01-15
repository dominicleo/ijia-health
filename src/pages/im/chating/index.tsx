import * as React from 'react';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import { useQuery } from 'remax';
import { usePageEvent } from 'remax/runtime';
import { chooseImage, chooseMedia, nextTick, showModal, View } from 'remax/wechat';
import { Subscribe } from 'unstated';

import YunxinContainer from '@/containers/im';
import { useEventEmitter, useRequest } from '@/hooks';
import history from '@/utils/history';
import Yunxin, { NIM_MESSAGE_TYPE, NIM_SCENE, SendMessageOptions } from '@/utils/im';

import { toolbarState, valueState } from './components/atoms';
import ChatingContainer from './components/container';
import ChatingContext from './components/context';
import ChatingHeader from './components/header';
import ChatingRecord from './components/record';
import { MESSAGE_RECORD_CUSTOM_TYPE } from './components/record/components/types.d';
import ChatingToolbar from './components/toolbar';
import {
  CHATING_TOOLBAR,
  MESSAGEBAR_ACTION_TYPE,
  MessagebarSendAction,
  ChatingAction,
  CHATING_ACTION_TYPE,
  CHATING_MEDIA_TYPE,
} from './components/types.d';
import s from './index.less';
import PAGE from '@/constants/page';
import { getCurrentPage, isBoolean, noop } from '@/utils';
import { MESSAGE } from '@/constants';
import { isFunction } from '@/hooks/utils';
import { AuthorizeError } from '@/utils/error';
import { DoctorService, OrderService } from '@/services';
import Toast from '@/components/toast';
import ChatingStatus from './components/status';
import {
  ORDER_PAYMENT_STATUS,
  ORDER_PROCESS_STATUS,
  ORDER_STATUS,
} from '@/services/order/index.types.d';

const handleError = (error: Error, cb?: () => void, cancel?: () => void) => {
  if (AuthorizeError.is(error)) {
    isFunction(cancel) && cancel();
    history.push(PAGE.AUTHORIZE);
    return;
  }
  showModal({
    title: MESSAGE.SYSTEM_PROMPT,
    content: `${MESSAGE.REQUEST_FAILED}\n${error.message}`,
    showCancel: true,
    confirmText: MESSAGE.RETRY,
    cancelText: '返回',
    success: ({ confirm }) => {
      if (confirm) {
        isFunction(cb) && cb();
      }
      history.back();
    },
  });
};

const Page = () => {
  const { sessionId, account, scene } = useQuery<{
    sessionId: string;
    account: string;
    scene: NIM_SCENE;
  }>();
  const setValue = useSetRecoilState(valueState);
  const setToolbar = useSetRecoilState(toolbarState);
  const chating$ = useEventEmitter<ChatingAction>();

  // 初始化云信/获取医生信息
  const { data: doctor, loading, run: init, mutate } = useRequest(
    async () => {
      const response = await DoctorService.queryByAccount(account);
      await Yunxin.init();
      return { ...response, loaded: true };
    },
    {
      manual: true,
      onSuccess: ({ id }) => {
        queryOrder(id);
        queryOnlineStatus(id);
      },
    },
  );

  // 轮询医生在线
  const { run: queryOnlineStatus, cancel } = useRequest(DoctorService.status, {
    manual: true,
    pollingInterval: 5000,
    onSuccess: ({ online }) => {
      isBoolean(online) && mutate((state) => ({ ...state, online: online }));
    },
    onError: (error) => {
      handleError(error, queryOnlineStatus, cancel);
    },
  });

  // 获取订单信息
  const {
    data: order,
    loading: orderLoading,
    run: queryOrder,
    mutate: updateOrder,
    cancel: cancelQueryOrder,
  } = useRequest(
    async (doctorId: string) => {
      const response = await OrderService.query(doctorId);
      return { ...response, loaded: true };
    },
    {
      manual: true,
      onError: (error) => {
        handleError(error, queryOnlineStatus, cancel);
      },
    },
  );

  React.useEffect(() => {
    nextTick(init);
  }, []);

  const onFinish = () => {
    updateOrder((state) => ({ ...state, expire: 0 }));
  };

  const onBack = () => {
    history.back();
  };

  const sendMessage = async (options: SendMessageOptions) => {
    try {
      const config = Yunxin.getSendMessage({ ...options, sessionId, to: account, scene });
      YunxinContainer.updateMessage(config);
      const message = await Yunxin.sendMessage(config as any);
      message.time = config.time;
      YunxinContainer.updateMessage(message);
    } catch (error) {
      if (error.code === 7101) {
        Toast('你已被对方拉黑');
        return;
      }
      Toast(error.message);
    }
  };

  // 检查订单
  const handleCheckOrder = () => {
    if (loading) return Promise.reject(new Error('聊天室未初始化完成'));

    // 已支付未接单
    if (
      order?.status === ORDER_STATUS.NORMAL &&
      order?.paymentStatus === ORDER_PAYMENT_STATUS.PAYED &&
      order?.processStatus === ORDER_PROCESS_STATUS.UN_RECEPTION
    ) {
      return Promise.resolve(null);
    }

    // 有效期内
    if (order?.expire && order.expire > 0) {
      return Promise.resolve(null);
    }

    // 打开订单确认界面
    chating$.emit({ type: CHATING_ACTION_TYPE.PAYMENT });

    return Promise.reject(new Error('订单不存在'));
  };

  const handleSend = (action: MessagebarSendAction) => {
    if (action.type === MESSAGEBAR_ACTION_TYPE.TEXT) {
      setValue('');
      sendMessage({ type: NIM_MESSAGE_TYPE.TEXT, text: action.payload });
    }
    if (action.type === MESSAGEBAR_ACTION_TYPE.AUDIO) {
      sendMessage({
        type: NIM_MESSAGE_TYPE.AUDIO,
        wxFilePath: action.payload.tempFilePath,
      });
    }
    if (action.type === MESSAGEBAR_ACTION_TYPE.EMOJI) {
      const { catalog, name } = action.payload;
      const content = {
        type: MESSAGE_RECORD_CUSTOM_TYPE.CHARTLET,
        data: {
          catalog: catalog,
          chartlet: name,
        },
      };
      setToolbar(CHATING_TOOLBAR.HIDDEN);
      sendMessage({
        type: NIM_MESSAGE_TYPE.CUSTOM,
        content: JSON.stringify(content),
      });
    }
  };

  const handleMedia = async (type: CHATING_MEDIA_TYPE) => {
    switch (type) {
      case CHATING_MEDIA_TYPE.ALBUM:
        const { tempFiles: images } = await chooseImage({ sourceType: [CHATING_MEDIA_TYPE.ALBUM] });
        images.forEach((file) =>
          sendMessage({ type: NIM_MESSAGE_TYPE.IMAGE, wxFilePath: file.path }),
        );
        break;
      case CHATING_MEDIA_TYPE.CAMERA:
        const { tempFiles: files } = await chooseMedia({ sourceType: [CHATING_MEDIA_TYPE.CAMERA] });
        files.forEach((file) =>
          sendMessage({ type: NIM_MESSAGE_TYPE.VIDEO, wxFilePath: file.tempFilePath }),
        );
        break;
      case CHATING_MEDIA_TYPE.VIDEO:
      case CHATING_MEDIA_TYPE.VOICE:
        history.push(PAGE.VIDEO_CALL, { type, account });
        break;
    }
  };

  chating$.useSubscription(async (action) => {
    // 发送消息
    if (action.type === CHATING_ACTION_TYPE.SEND) {
      handleCheckOrder()
        .then(() => handleSend(action.payload))
        .catch(noop);
    }

    // 点击操作
    if (action.type === CHATING_ACTION_TYPE.MEDIA) {
      handleCheckOrder()
        .then(() => handleMedia(action.payload))
        .catch(noop);
    }
  });

  return (
    <>
      <Toast.Component />
      <View className={s.wrapper}>
        <ChatingHeader
          title={`医生：${doctor?.name}`}
          subtitle={doctor?.online ? MESSAGE.ONLINE : MESSAGE.OFFLINE}
          loading={!doctor?.loaded || loading}
          onBack={onBack}
        />
        <ChatingStatus data={order} loading={!order?.loaded || orderLoading} onFinish={onFinish} />
        <ChatingContext.Provider value={{ chating$ }}>
          <ChatingContainer>
            <Subscribe to={[YunxinContainer]}>
              {({ state }) => (
                <ChatingRecord
                  messages={Yunxin.formatMessageRecordList(
                    state.messages[sessionId] || {},
                    state.users,
                  )}
                />
              )}
            </Subscribe>
            <ChatingToolbar />
          </ChatingContainer>
        </ChatingContext.Provider>
      </View>
    </>
  );
};

export default () => (
  <RecoilRoot>
    <Page />
  </RecoilRoot>
);
