import { Article } from '@/services/article/index.types';
import * as React from 'react';
import { hideLoading, nextTick, showLoading, showToast, View } from 'remax/wechat';
import classnames from 'classnames';

import s from './index.less';
import { useRequest, useStorageState } from '@/hooks';
import { ArticleService } from '@/services';
import Toast from '@/components/toast';
import ArticleContext from '../context';
import { STORAGE } from '@/constants';
import { unstable_batchedUpdates } from 'remax/runtime';

interface ArticleLikeProps extends Pick<Article, 'like' | 'likes'> {
  articleId: number | string;
}

const ArticleLike: React.FC<ArticleLikeProps> = React.memo(({ articleId, like, likes }) => {
  const { mutate } = React.useContext(ArticleContext);
  const [animation, setAnimation] = React.useState(false);
  const timer = React.useRef<NodeJS.Timeout>();

  const [, updateLikesCache] = useStorageState<number | undefined>(
    STORAGE.ARTICLE_LIKE_CACHE_PREFIX + articleId,
  );

  const { loading, run } = useRequest(() => ArticleService.like(articleId), {
    manual: true,
    loadingDelay: 200,
    onSuccess() {
      nextTick(() => {
        unstable_batchedUpdates(() => {
          setAnimation(true);
          mutate((state) => ({ ...state, like: !like, likes: like ? likes - 1 : likes + 1 }));
          updateLikesCache(likes + 1);
        });
        timer.current && clearTimeout(timer.current);
        timer.current = setTimeout(() => setAnimation(false), 500);
      });
    },
  });

  React.useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  const onClick = () => {
    if (loading) return;
    if (like) {
      showToast({ title: '已点赞', icon: 'none' });
      return;
    }
    showLoading();
    run().finally(() => hideLoading());
  };

  return (
    <View className={s.wrapper}>
      <View
        className={classnames(s.like, { [s.active]: like, [s.animation]: animation })}
        onClick={onClick}
      >
        <View className={s.thumb} />
      </View>
      <View className={s.total}>{likes}人点赞</View>
    </View>
  );
});

export default ArticleLike;
