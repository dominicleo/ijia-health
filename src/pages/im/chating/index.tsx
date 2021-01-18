import * as React from 'react';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import { useQuery } from 'remax';
import { usePageEvent } from 'remax/runtime';
import { chooseImage, chooseMedia, nextTick, showModal, View } from 'remax/wechat';
import { Subscribe } from 'unstated';

import Toast from '@/components/toast';
import { MESSAGE } from '@/constants';
import PAGE from '@/constants/page';
import YunxinContainer from '@/containers/im';
import { useEventEmitter, useRequest } from '@/hooks';
import { isFunction } from '@/hooks/utils';
import { DoctorService, OrderService } from '@/services';
import {
  ORDER_PAYMENT_STATUS,
  ORDER_PROCESS_STATUS,
  ORDER_STATUS,
} from '@/services/order/index.types.d';
import { isArray, isBoolean, JSONParse, noop } from '@/utils';
import { AuthorizeError } from '@/utils/error';
import GlobalData from '@/utils/globalData';
import history from '@/utils/history';
import Yunxin, {
  NIM_MESSAGE_TYPE,
  NIM_SCENE,
  NimMessage,
  SendMessageOptions,
  NETCALL_TYPE_VALUE,
} from '@/utils/im';
import createSocket from '@/utils/socket';

import { toolbarState, valueState } from './components/atoms';
import ChatingContainer from './components/container';
import ChatingContext from './components/context';
import ChatingHeader from './components/header';
import ChatingPayment from './components/payment';
import ChatingRecord from './components/record';
import { MESSAGE_RECORD_CUSTOM_TYPE } from './components/record/components/types.d';
import ChatingStatus from './components/status';
import ChatingToolbar from './components/toolbar';
import {
  CHATING_ACTION_TYPE,
  CHATING_MEDIA_TYPE,
  CHATING_TOOLBAR,
  ChatingAction,
  MESSAGEBAR_ACTION_TYPE,
  MessagebarSendAction,
} from './components/types.d';
import s from './index.less';

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
        return;
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
  const socket = React.useRef<createSocket>();

  // 初始化云信/获取医生信息
  const { data: doctor, run, mutate } = useRequest(
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
      onError: (error) => {
        handleError(error, init);
      },
    },
  );

  // 轮询医生在线
  const { run: queryOnlineStatus, cancel: cancelQueryOnlineStatus } = useRequest(
    DoctorService.status,
    {
      manual: true,
      pollingInterval: 5000,
      onSuccess: ({ online }) => {
        isBoolean(online) && mutate((state) => ({ ...state, online: online }));
      },
      onError: (error) => {
        handleError(error, queryOnlineStatus, cancelQueryOnlineStatus);
      },
    },
  );

  // 获取订单信息
  const {
    data: order,
    run: queryOrder,
    mutate: updateOrder,
    cancel: cancelQueryOrder,
  } = useRequest(
    async (doctorId: string) => {
      const response = await OrderService.queryByDoctorId(doctorId);
      return { ...response, loaded: true };
    },
    {
      manual: true,
      onError: (error) => {
        handleError(error, queryOnlineStatus, cancelQueryOrder);
      },
    },
  );

  const init = () => {
    nextTick(run);
    if (socket.current) return;
    socket.current = new createSocket((data: any) => {
      const { tags } = data || {};
      if (isArray(tags) && tags.includes('P2P_REFRESH_ORDER')) {
        chating$?.emit({ type: CHATING_ACTION_TYPE.REFRESH_ORDER });
      }
    });
  };

  usePageEvent('onShow', init);
  usePageEvent('onHide', () => destroy());

  React.useEffect(() => {
    GlobalData.event.on('onMessage', onMessage);
  }, []);

  const destroy = () => {
    cancelQueryOnlineStatus();
    cancelQueryOrder();
    GlobalData.event.off('onMessage', onMessage);
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
    if (!doctor?.loaded) return Promise.reject(new Error('聊天室未初始化完成'));

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
    if (action.type === MESSAGEBAR_ACTION_TYPE.TEXT && action.payload) {
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
      case CHATING_MEDIA_TYPE.AUDIO:
        history.push(PAGE.VIDEO_CALL, {
          type:
            type === CHATING_MEDIA_TYPE.AUDIO ? NETCALL_TYPE_VALUE.AUDIO : NETCALL_TYPE_VALUE.VIDEO,
          callee: account,
        });
        break;
    }

    setToolbar(CHATING_TOOLBAR.HIDDEN);
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

    // 刷新订单信息
    if (action.type === CHATING_ACTION_TYPE.REFRESH_ORDER) {
      doctor && queryOrder(doctor.id);
    }
  });

  function onMessage(message: NimMessage) {
    if (!(message && sessionId === message.sessionId)) return;
    const { type, data } = JSONParse(message.content);
    const { code } = data || {};
    // 医生回复消息
    const isStartTiming = type === MESSAGE_RECORD_CUSTOM_TYPE.SYSTEM && code === '3';
    // 医生主动结束订单 / 服务时间过期
    const isCloseOrder =
      (type === MESSAGE_RECORD_CUSTOM_TYPE.PAYRESULT ||
        type === MESSAGE_RECORD_CUSTOM_TYPE.SETMEAL) &&
      code === '1';

    (isStartTiming || isCloseOrder) && chating$?.emit({ type: CHATING_ACTION_TYPE.REFRESH_ORDER });
  }

  const onFinish = () => {
    updateOrder((state) => ({ ...state, expire: 0 }));
  };

  const onBack = () => {
    destroy();
    YunxinContainer.resetSessionId();
    socket.current && socket.current.destroy();
    history.back();
  };

  return (
    <ChatingContext.Provider value={{ chating$ }}>
      <Toast.Component />
      {doctor && <ChatingPayment doctor={doctor} />}
      <View className={s.wrapper}>
        <ChatingHeader
          title={doctor?.name && `医生：${doctor.name}`}
          subtitle={doctor?.online ? MESSAGE.ONLINE : MESSAGE.OFFLINE}
          loading={!doctor}
          onBack={onBack}
        />
        <ChatingStatus data={order} loading={!order?.loaded} onFinish={onFinish} />

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
      </View>
    </ChatingContext.Provider>
  );
};

export default () => (
  <RecoilRoot>
    <Page />
  </RecoilRoot>
);
