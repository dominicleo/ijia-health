import classnames from 'classnames';
import * as React from 'react';
import { hideLoading, showLoading, View } from 'remax/wechat';

import { useRequest } from '@/hooks';
import { ArticleService } from '@/services';

import ArticleContext from '../context';
import s from './index.less';

const ArticleBookmark: React.FC<{ articleId: number | string; value: boolean }> = React.memo(
  ({ articleId, value }) => {
    const { mutate } = React.useContext(ArticleContext);
    const { run, loading } = useRequest(() => ArticleService.bookmark(articleId), {
      manual: true,
      onSuccess() {
        mutate((state) => ({ ...state, bookmark: !value }));
      },
    });

    const onClick = () => {
      if (loading) return;
      showLoading({ title: '' });
      run().finally(() => hideLoading());
    };

    return (
      <View className={classnames(s.bookmark, { [s.active]: value })} onClick={onClick}>
        {value && '已'}收藏
      </View>
    );
  },
);

export default ArticleBookmark;
