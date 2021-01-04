import * as React from 'react';
import Empty from '@/components/empty';
import { MESSAGE } from '@/constants';
import PAGE from '@/constants/page';
import YunxinContainer from '@/containers/im';
import { useRequest } from '@/hooks';
import { getCurrentPage, noop } from '@/utils';
import { AuthorizeError } from '@/utils/error';
import history from '@/utils/history';
import Yunxin, { NimSession, NimUser } from '@/utils/im';
import Subscribe from '@/utils/unstated/subscribe';
import Button from '@vant/weapp/lib/button';
import dayjs from 'dayjs';
import { usePageEvent } from 'remax/macro';
import { nextTick, ScrollView, View } from 'remax/wechat';

import s from './index.less';
import SessionItem from './item';
import isEqual from 'lodash.isequal';

const SessionItemWrapper: React.FC<{
  data: NimSession;
  user: NimUser;
}> = React.memo(({ data, user }) => {
  const { id, scene, to, lastMsg, unread, updateTime } = data;
  const onClick = () => {
    Promise.all([YunxinContainer.setSessionId(id), Yunxin.resetSessionUnread(data)]).finally(() => {
      history.push(PAGE.CHATING, { sessionId: id, account: to, scene });
    });
  };

  const content = Yunxin.getSessionMessage(lastMsg);

  return (
    <SessionItem
      unread={unread}
      name={user?.nick}
      avatar={user?.avatar}
      content={content}
      date={dayjs(updateTime).calendar()}
      onClick={onClick}
    />
  );
}, isEqual);

interface MessageSessionProps {
  visible?: boolean;
}

const MessageSession: React.FC<MessageSessionProps> = ({ visible }) => {
  const { data, error, loading, run } = useRequest(
    async () => {
      await Yunxin.init();
      return { loaded: true };
    },
    { manual: true, onError: noop },
  );

  React.useEffect(() => {
    visible && !data?.loaded && nextTick(run);
  }, [visible]);

  usePageEvent('onShow', () => {
    const page = getCurrentPage();
    const refer = page.__displayReporter.showReferpagepath;
    if (['pages/authorize/index.html'].includes(refer) && visible && !data?.loaded) {
      nextTick(run);
    }
  });

  let content;

  if (data?.loaded) {
    content = (
      <Subscribe to={[YunxinContainer]}>
        {({ state }) => {
          const sessions = Object.values(state.sessions);
          return state.synced ? (
            <ScrollView className={s.container} scrollY>
              {sessions.map((session) => (
                <SessionItemWrapper
                  key={session.id}
                  data={session}
                  user={state.users[session.to]}
                />
              ))}
            </ScrollView>
          ) : (
            <SessionItem.Loader size={7} />
          );
        }}
      </Subscribe>
    );
  } else if (error) {
    const description = AuthorizeError.is(error) ? (
      MESSAGE.MESSAGE_EMPTY
    ) : (
      <>
        {MESSAGE.REQUEST_FAILED}
        <View>{error.message}</View>
      </>
    );

    const children = (
      <Button
        type='primary'
        size='small'
        bindclick={AuthorizeError.is(error) ? () => history.push(PAGE.AUTHORIZE) : run}
        loading={loading}
        disabled={loading}
        round
      >
        {AuthorizeError.is(error) ? MESSAGE.AUTHORIZED_LOGIN : MESSAGE.RETRY}
      </Button>
    );

    content = (
      <Empty image='record' description={description}>
        {children}
      </Empty>
    );
  } else {
    content = <SessionItem.Loader size={7} />;
  }

  return <View className={s.wrapper}>{content}</View>;
};

export default MessageSession;
