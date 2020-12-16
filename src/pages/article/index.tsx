import * as React from 'react';
import {
  hideShareMenu,
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
import { useQuery, useRequest, useShareMessage, useStorageState } from '@/hooks';
import { ArticleService } from '@/services';
import { noop } from '@/utils';
import history, { createURL } from '@/utils/history';
import html2json from '@/utils/html2json';

import ArticleBookmark from './components/bookmark';
import ArticleContext from './components/context';
import ArticleDoctorCard from './components/doctor-card';
import ArticleHeader from './components/header';
import LaunchApp from './components/launch-app';
import ArticleRecommend from './components/recommend';
import SafeArea from '@/components/safe-area';
import s from './index.less';
import ArticleLike from './components/like';

const CONTAINER_ELEMENT_ID = 'main';
const OBSERVER_ELEMENT_ID = 'doctorcard';

const ArticleContent: React.FC<{ content: string }> = React.memo(({ content }) => {
  return <RichText className={s.content} nodes={html2json(content)} />;
});

export default () => {
  const { articleId } = useQuery<{ articleId: string }>();
  const [, updateSharesCache] = useStorageState<number | undefined>(
    STORAGE.ARTICLE_SHARE_CACHE_PREFIX + articleId,
  );
  const { data, run, mutate } = useRequest(
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
    },
  );

  const shares = React.useRef(0);
  const { title, date, reads, bookmark, doctor, articles, like, likes, reward, loaded } =
    data || {};

  React.useEffect(() => {
    hideShareMenu();
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
      title,
      path: createURL(PAGE.ARTICLE, { articleId }),
    };
  });

  React.useEffect(() => {
    if (!articleId) return;
    run(articleId);
  }, []);

  const onClickReward = (event: TouchEvent) => {
    // @ts-ignore
    event.stopPropagation();
    history.push(PAGE.REWARD, { articleId });
  };

  let content;

  if (loaded) {
    content = (
      <ArticleContext.Provider value={{ mutate }}>
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
              <ArticleBookmark articleId={articleId} value={!!bookmark} />
            </View>
            {doctor && <ArticleDoctorCard id={OBSERVER_ELEMENT_ID} data={doctor} />}
            <ArticleContent content={data?.content || ''} />
            <ArticleLike articleId={articleId} like={like!} likes={likes!} />
          </View>
          {articles && articles.length > 0 && <ArticleRecommend data={articles} />}
        </View>
      </ArticleContext.Provider>
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
      <ScrollView id={CONTAINER_ELEMENT_ID} className={s.main} scrollY>
        {content}
      </ScrollView>
      {loaded && (
        <View className={s.toolbar}>
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
          <SafeArea />
        </View>
      )}
    </View>
  );
};
