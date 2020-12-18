import classnames from 'classnames';
import * as React from 'react';
import { unstable_batchedUpdates } from 'remax/runtime';
import { nextTick, View } from 'remax/wechat';

import Toast from '@/components/toast';
import { STORAGE } from '@/constants';
import { useRequest, useStorageState } from '@/hooks';
import { ArticleService } from '@/services';
import { Article, ArticleId } from '@/services/article/index.types';

import ArticleContext from '../context';
import s from './index.less';

interface ArticleLikeProps extends Pick<Article, 'like' | 'likes'> {
  id: ArticleId;
}

const ArticleLike: React.FC<ArticleLikeProps> = React.memo(({ id, like, likes }) => {
  const { mutate } = React.useContext(ArticleContext);
  const [animation, setAnimation] = React.useState(false);
  const timer = React.useRef<NodeJS.Timeout>();

  const [, updateLikesCache] = useStorageState<number | undefined>(
    STORAGE.ARTICLE_LIKE_CACHE_PREFIX + id,
  );

  const { loading, run } = useRequest(() => ArticleService.like(id), {
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

  const onClick = async () => {
    if (loading) return;
    if (like) {
      Toast('已点赞');
      return;
    }
    Toast.loading({ duration: 0 });
    await run();
    Toast.clear();
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
