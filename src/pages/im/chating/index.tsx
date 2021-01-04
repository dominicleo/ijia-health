import { useEventEmitter, useRequest } from '@/hooks';
import history from '@/utils/history';
import * as React from 'react';
import { useQuery } from 'remax';
import { nextTick, View } from 'remax/wechat';
import ChatingContainer from './components/container';
import ChatingContext from './components/context';
import ChatingHeader from './components/header';
import ChatingRecord from './components/record';
import ChatingToolbar from './components/toolbar';
import { MESSAGEBAR_ACTION_TYPE, MessagebarAction } from './components/types.d';
import { RecoilRoot } from 'recoil';

import s from './index.less';
import Subscribe from '@/utils/unstated/subscribe';
import YunxinContainer from '@/containers/im';
import Yunxin from '@/utils/im';
import { usePageEvent } from 'remax/runtime';

export default () => {
  const { sessionId, account } = useQuery<{ sessionId: string; account: string }>();
  const messagebar$ = useEventEmitter<MessagebarAction>();

  const { run: init, loading } = useRequest(
    async () => {
      await Yunxin.init();
      return { loaded: true };
    },
    { manual: true },
  );

  usePageEvent('onShow', () => {
    nextTick(init);
  });

  const onBack = () => {
    history.back();
  };

  messagebar$.useSubscription((action) => {
    console.log(action);
    if (action.type === MESSAGEBAR_ACTION_TYPE.SEND) {
      const { type, payload } = action.payload;
      if (type === 'text') {
      }
      if (type === 'audio') {
      }
      if (type === 'emoji') {
      }
    }
    if (action.type === MESSAGEBAR_ACTION_TYPE.MEDIA) {
    }

    if (action.type === MESSAGEBAR_ACTION_TYPE.PAYMENT) {
      // 显示支付窗口
    }
  });

  return (
    <View className={s.wrapper}>
      <ChatingHeader title='医生：正之筠' subtitle='在线' loading={loading} onBack={onBack} />
      <ChatingContext.Provider value={{ messagebar$ }}>
        <RecoilRoot>
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
        </RecoilRoot>
      </ChatingContext.Provider>
    </View>
  );
};
