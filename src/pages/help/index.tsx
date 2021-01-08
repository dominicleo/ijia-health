import Empty from '@/components/empty';
import { MESSAGE } from '@/constants';
import { useRequest } from '@/hooks';
import { HelpService } from '@/services';
import html2json from '@/utils/html2json';
import Button from '@vant/weapp/lib/button';
import Skeleton from '@vant/weapp/lib/skeleton';
import * as React from 'react';
import { useQuery } from 'remax';
import { RichText, View } from 'remax/wechat';

import s from './index.less';

export default () => {
  const { id, title } = useQuery<{ id: string; title: string }>();
  const { data, error, loading, run } = useRequest(
    async () => {
      const response = await HelpService.query(id);
      return { ...response, loaded: true };
    },
    { manual: true },
  );

  if (error) {
    return (
      <Empty
        image='record'
        description={
          <>
            {MESSAGE.REQUEST_FAILED}
            <View>{error.message}</View>
          </>
        }
      >
        <Button
          type='primary'
          size='small'
          bindclick={run}
          loading={loading}
          disabled={loading}
          round
        >
          {MESSAGE.RETRY}
        </Button>
      </Empty>
    );
  }

  let content;

  if (data?.loaded) {
    content = <RichText nodes={html2json(data?.content || '')} />;
  } else {
    content = (
      <Skeleton
        row={9}
        rowWidth={Array.from(Array(10).keys()).map((_, index) =>
          [3, 8].includes(index) ? '50%' : '100%',
        )}
        loading
      />
    );
  }

  return (
    <View className={s.wrapper}>
      <View className={s.title}>{decodeURIComponent(title)}</View>
      <View className={s.content}>{content}</View>
    </View>
  );
};
