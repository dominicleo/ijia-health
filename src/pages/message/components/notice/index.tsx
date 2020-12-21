import { useRequest } from '@/hooks';
import * as React from 'react';
import { nextTick, ScrollView, View } from 'remax/wechat';
import { MessageService } from '@/services';

import s from './index.less';
import { getCurrentPage, noop } from '@/utils';
import { Message, MESSAGE_TYPE } from '@/services/message/index.types';
import Empty from '@/components/empty';
import { AuthorizeError } from '@/utils/error';
import history from '@/utils/history';
import PAGE from '@/constants/page';
import Button from '@vant/weapp/lib/button';
import { usePageEvent } from 'remax/macro';
import chunk from 'lodash.chunk';
import ChunkList from '@/components/chunk-list';
import NoticeItem from './item';
import { MESSAGE } from '@/constants';

const EMPTY_TEXT = '这里空空如也，没有消息';

interface MessageNoticeProps {
  type: MESSAGE_TYPE;
  visible?: boolean;
}

const MessageNotice: React.FC<MessageNoticeProps> = ({ type, visible }) => {
  const [refresherTriggered, setRefresherTriggered] = React.useState(false);
  const [list, setList] = React.useState<Message[][]>([]);
  const { data, error, loading, run } = useRequest(
    async () => {
      const response = await MessageService.query(type);
      setList(chunk(response, 5));
      return { loaded: true };
    },
    {
      manual: true,
      onError: noop,
    },
  );

  const query = () => visible && !data?.loaded && nextTick(run);

  React.useEffect(() => {
    query();
    !visible && refresherTriggered && setRefresherTriggered(false);
  }, [visible]);

  usePageEvent('onShow', () => {
    const page = getCurrentPage();
    const refer = page.__displayReporter.showReferpagepath;
    /^pages\/authorize\/index\.html/i.test(refer) && query();
  });

  const onRefresherPulling = () => {
    if (loading || refresherTriggered) return;
    setRefresherTriggered(true);
  };

  const onRefresherRefresh = () => {
    if (!data?.loaded || loading) return;
    run().finally(() => setRefresherTriggered(false));
  };

  const onRefresherRestore = () => {
    setRefresherTriggered(false);
  };

  let content;

  if (data?.loaded) {
    content =
      list && list.length > 0 ? (
        <ScrollView
          className={s.content}
          onRefresherPulling={onRefresherPulling}
          onRefresherRefresh={onRefresherRefresh}
          onRefresherRestore={onRefresherRestore}
          onRefresherAbort={onRefresherRestore}
          refresherTriggered={refresherTriggered}
          refresherEnabled
          scrollY
        >
          <View className={s.container}>
            {list.map((items, index) => (
              <ChunkList key={`chunk_${index}`} chunkId={index} observeHeight={211 * 4}>
                {items.map((item) => (
                  <NoticeItem key={`MESSAGE_${type}_${item.id}`} {...item} />
                ))}
              </ChunkList>
            ))}
          </View>
        </ScrollView>
      ) : (
        <Empty image='message' description={EMPTY_TEXT} />
      );
  } else if (error) {
    const description = AuthorizeError.is(error) ? (
      EMPTY_TEXT
    ) : (
      <>
        数据获取失败<View>{error.message}</View>
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
        {AuthorizeError.is(error) ? '授权登录' : MESSAGE.RETRY}
      </Button>
    );

    content = (
      <Empty image='record' description={description}>
        {children}
      </Empty>
    );
  } else {
    content = (
      <View className={s.container}>
        <NoticeItem.Loader size={4} />
      </View>
    );
  }

  return <View className={s.wrapper}>{content}</View>;
};

export default MessageNotice;
