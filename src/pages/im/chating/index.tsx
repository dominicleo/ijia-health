import { useEventEmitter } from '@/hooks';
import history from '@/utils/history';
import * as React from 'react';
import { useQuery } from 'remax';
import { View } from 'remax/wechat';
import ChatingContainer from './components/container';
import ChatingContext from './components/context';
import ChatingHeader from './components/header';
import ChatingRecord from './components/record';
import ChatingToolbar from './components/toolbar';
import { MESSAGEBAR_ACTION_TYPE, MessagebarAction } from './components/types.d';

import s from './index.less';

export default () => {
  const { account } = useQuery<{ account: string }>();
  const messagebar$ = useEventEmitter<MessagebarAction>();
  const [loading, setLoading] = React.useState(false);

  const onBack = () => {
    history.back();
  };

  messagebar$.useSubscription((action) => {
    if (action.type === MESSAGEBAR_ACTION_TYPE.MEDIA) {
      console.log('media', action.payload);
    }
  });

  return (
    <View className={s.wrapper}>
      <ChatingHeader title='医生：正之筠' subtitle='在线' loading={loading} onBack={onBack} />
      <ChatingContext.Provider value={{ messagebar$ }}>
        <ChatingContainer>
          <ChatingRecord />
          <ChatingToolbar />
        </ChatingContainer>
      </ChatingContext.Provider>
    </View>
  );
};
