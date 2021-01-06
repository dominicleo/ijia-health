import * as React from 'react';
import { RecoilRoot, useSetRecoilState } from 'recoil';
import { useQuery } from 'remax';
import { usePageEvent } from 'remax/runtime';
import { chooseImage, chooseMedia, nextTick, View } from 'remax/wechat';
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
import { getCurrentPage } from '@/utils';

const Page = () => {
  const { sessionId, account, scene } = useQuery<{
    sessionId: string;
    account: string;
    scene: NIM_SCENE;
  }>();
  const setValue = useSetRecoilState(valueState);
  const setToolbar = useSetRecoilState(toolbarState);
  const chating$ = useEventEmitter<ChatingAction>();

  const { run: init, loading } = useRequest(
    async () => {
      await Yunxin.init();
      return { loaded: true };
    },
    { manual: true },
  );

  React.useEffect(() => {
    nextTick(init);
  }, []);

  const onBack = () => {
    history.back();
  };

  const sendMessage = async (options: SendMessageOptions) => {
    const config = Yunxin.getSendMessage({ ...options, sessionId, to: account, scene });
    YunxinContainer.updateMessage(config);
    const message = await Yunxin.sendMessage(config as any);
    message.time = config.time;
    YunxinContainer.updateMessage(message);
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

  chating$.useSubscription((action) => {
    // 发送消息
    if (action.type === CHATING_ACTION_TYPE.SEND) {
      handleSend(action.payload);
    }

    // 点击操作
    if (action.type === CHATING_ACTION_TYPE.MEDIA) {
      handleMedia(action.payload);
    }

    if (action.type === CHATING_ACTION_TYPE.PAYMENT) {
      // 显示支付窗口
    }
  });

  return (
    <View className={s.wrapper}>
      <ChatingHeader title='医生：正之筠' subtitle='在线' loading={loading} onBack={onBack} />
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
  );
};

export default () => (
  <RecoilRoot>
    <Page />
  </RecoilRoot>
);
