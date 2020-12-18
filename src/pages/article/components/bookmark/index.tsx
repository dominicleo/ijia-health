import classnames from 'classnames';
import * as React from 'react';
import { View } from 'remax/wechat';

import Toast from '@/components/toast';
import { useRequest } from '@/hooks';
import { ArticleService } from '@/services';
import { ArticleId } from '@/services/article/index.types';

import ArticleContext from '../context';
import s from './index.less';

const ArticleBookmark: React.FC<{ id: ArticleId; value: boolean }> = React.memo(({ id, value }) => {
  const { mutate } = React.useContext(ArticleContext);
  const { run, loading } = useRequest(() => ArticleService.bookmark(id), {
    manual: true,
    onSuccess() {
      mutate((state) => ({ ...state, bookmark: !value }));
    },
  });

  const onClick = async () => {
    if (loading) return;
    Toast.loading({ duration: 0 });
    await run();
    Toast.clear();
  };

  return (
    <View className={classnames(s.bookmark, { [s.active]: value })} onClick={onClick}>
      {value && '已'}收藏
    </View>
  );
});

export default ArticleBookmark;
