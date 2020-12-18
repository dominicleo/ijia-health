import * as React from 'react';
import {
  hideShareMenu,
  nextTick,
  RichText,
  ScrollView,
  showShareMenu,
  Text,
  TouchEvent,
  View,
} from 'remax/wechat';

import Toast from '@/components/toast';
import { STORAGE } from '@/constants';
import PAGE from '@/constants/page';
import { useEventEmitter, useRequest, useShareMessage, useStorageState } from '@/hooks';
import { ArticleService } from '@/services';
import { noop } from '@/utils';
import history, { createURL } from '@/utils/history';
import html2json from '@/utils/html2json';

import ArticleBookmark from './components/bookmark';
import ArticleContext, { CommentEventAction } from './components/context';
import ArticleDoctorCard from './components/doctor-card';
import ArticleHeader from './components/header';
import LaunchApp from './components/launch-app';
import ArticleRecommend from './components/recommend';
import s from './index.less';
import ArticleLike from './components/like';
import ArticleToolbar from './components/toolbar';
import ArticleComment from './components/comment';
import Skeleton from '@vant/weapp/lib/skeleton';
import Empty from '@/components/empty';
import Button from '@vant/weapp/lib/button';
import { ServiceError } from '@/utils/error';
import { useQuery } from 'remax';

const CONTAINER_ELEMENT_ID = 'main';
const OBSERVER_ELEMENT_ID = 'doctorcard';

const ArticleContent: React.FC<{ content: string }> = React.memo(({ content }) => {
  return <RichText className={s.content} nodes={html2json(content)} />;
});

const DELETED_CODE = 4118643;

export default () => {
  const { articleId } = useQuery<{ articleId?: string }>();
  const comment$ = useEventEmitter<CommentEventAction>();

  const { data, loading, error, run, mutate } = useRequest(
    async (params) => {
      const [response] = await Promise.all([
        ArticleService.query(params),
        ArticleService.read(params).catch(noop),
      ]);

      return { ...response, loaded: true };
    },
    {
      cacheKey: `ARTICLE_${articleId}`,
      manual: true,
      onSuccess() {
        showShareMenu();
      },
      onError: noop,
    },
  );

  const [, updateSharesCache] = useStorageState<number | undefined>(
    STORAGE.ARTICLE_SHARE_CACHE_PREFIX + data?.id,
  );

  const shares = React.useRef(0);

  const query = () => {
    if (!articleId) return;
    run(articleId);
  };

  React.useEffect(() => {
    hideShareMenu();
    nextTick(query);
  }, []);

  React.useEffect(() => {
    data?.shares && (shares.current = data?.shares);
  }, [data?.shares]);

  useShareMessage((event) => {
    const { from } = event;

    if (from === 'button') {
      const { id, title, picture } = event.target.dataset;
      return {
        title,
        path: createURL(PAGE.ARTICLE, { articleId: id }),
        imageUrl: picture,
      };
    }

    shares.current++;
    updateSharesCache(shares.current);

    return {
      title: data?.title,
      path: createURL(PAGE.ARTICLE, { articleId }),
    };
  });

  const onClickReward = (event: TouchEvent) => {
    // @ts-ignore
    event.stopPropagation();
    history.push(PAGE.REWARD, { articleId });
  };

  let content;

  if (data?.loaded) {
    const {
      id,
      title,
      date,
      reads,
      bookmark,
      doctor,
      articles,
      like,
      likes,
      reward,
      loaded,
    } = data;
    content = (
      <ArticleContext.Provider value={{ mutate, comment$ }}>
        <ScrollView id={CONTAINER_ELEMENT_ID} className={s.main} scrollY>
          <View className={s.container}>
            <View className={s.article}>
              <View className={s.title}>{title}</View>
              <View className={s.details}>
                <View>
                  <Text className={s.label}>发布时间</Text>
                  <Text className={s.value}>{date}</Text>
                  <Text className={s.label}>浏览</Text>
                  <Text className={s.value}>{reads}</Text>
                </View>
                <ArticleBookmark id={id} value={!!bookmark} />
              </View>
              {doctor && <ArticleDoctorCard id={OBSERVER_ELEMENT_ID} data={doctor} />}
              <ArticleContent content={data.content} />
              <ArticleLike id={id} like={like!} likes={likes} />
            </View>
            <ArticleComment id={id} />
            {articles && articles.length > 0 && <ArticleRecommend data={articles} />}
            {loaded && (
              <ArticleToolbar id={id}>
                <LaunchApp />
                {reward && (
                  <View
                    className={s.reward}
                    onClick={onClickReward}
                    hoverClassName='clickable-opacity'
                    hoverStayTime={0}
                    hoverStopPropagation
                  >
                    打赏作者
                  </View>
                )}
              </ArticleToolbar>
            )}
          </View>
        </ScrollView>
      </ArticleContext.Provider>
    );
  } else if (error) {
    const isDeleted = ServiceError.is(error) && error.code === DELETED_CODE;
    const message = isDeleted ? '该文章已被作者删除' : error.message;
    const buttonText = isDeleted ? '知道啦' : '重新加载';
    content = (
      <Empty
        image='record'
        description={
          isDeleted ? (
            message
          ) : (
            <>
              数据获取失败<View>{message}</View>
            </>
          )
        }
        local
      >
        <Button
          type='primary'
          size='small'
          bindclick={() => (isDeleted ? history.back() : query())}
          loading={loading}
          disabled={loading}
          round
        >
          {buttonText}
        </Button>
      </Empty>
    );
  } else {
    content = (
      <View className={s.loader}>
        <View className={s.title}>
          <Skeleton row={2} rowWidth={['100%', '50%']} loading />
        </View>
        <View className={s.details}>
          <Skeleton title loading />
        </View>
        <View className='doctorcard'>
          <Skeleton avatar row={2} rowWidth={['25%', '50%']} loading />
        </View>
        <View className={s.content}>
          <Skeleton row={5} rowWidth={['100%', '100%', '75%', '50%']} loading />
        </View>
      </View>
    );
  }

  return (
    <View className={s.wrapper}>
      <Toast.Component />
      <ArticleHeader
        doctor={data?.doctor}
        containerSelector={`#${CONTAINER_ELEMENT_ID}`}
        selector={`#${OBSERVER_ELEMENT_ID}`}
      />
      {content}
    </View>
  );
};
