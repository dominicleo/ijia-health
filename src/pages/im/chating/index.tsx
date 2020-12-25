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
import { noop } from '@/utils';
import Yunxin from '@/utils/im';
import { usePageEvent } from 'remax/runtime';

export default () => {
  const { account } = useQuery<{ account: string }>();
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
      console.log('media', action.payload);
    }
  });

  return (
    <View className={s.wrapper}>
      <ChatingHeader title='医生：正之筠' subtitle='在线' loading={loading} onBack={onBack} />
      <ChatingContext.Provider value={{ messagebar$ }}>
        <RecoilRoot>
          <ChatingContainer>
            <Subscribe to={[YunxinContainer]}>
              {() => <ChatingRecord data={YunxinContainer} />}
            </Subscribe>
            <ChatingToolbar />
          </ChatingContainer>
        </RecoilRoot>
      </ChatingContext.Provider>
    </View>
  );
};
