import classnames from 'classnames';
import qs from 'qs';
import * as React from 'react';
import {
  makePhoneCall,
  scanCode,
  ScrollView,
  Swiper,
  SwiperItem,
  View,
  createSelectorQuery,
} from 'remax/wechat';

import ArticleItem from '@/components/article-item';
import SafeArea from '@/components/safe-area';
import Toast from '@/components/toast';
import { CUSTOMER_SERVICE_TELEPHONE } from '@/constants/common';
import { DOCTOR_SEARCH_PLACEHOLDER } from '@/constants/message';
import PAGE from '@/constants/page';
import { useRequest, useShareMessage } from '@/hooks';
import { ArticleService } from '@/services';
import { isArray, isNativeCancel, isString, noop } from '@/utils';
import history, { createURL } from '@/utils/history';
import Skeleton from '@vant/weapp/lib/skeleton';

import s from './index.less';
import Empty from '@/components/empty';
import Button from '@vant/weapp/lib/button';

const ENTRANCES = [
  {
    key: 'my-doctor',
    title: '我的医生',
    path: PAGE.MY_DOCTOR,
    authorize: true,
  },
  {
    key: 'archives',
    title: '健康档案',
    path: PAGE.ARCHIVES,
  },
  {
    key: 'article',
    title: '健康科普',
    path: createURL(PAGE.ARTICLE_LIST, { type: 'special' }),
  },
];

const DEFAULT_HEIGHT = 350;

export default () => {
  const [refresherTriggered, setRefresherTriggered] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [heights, setHeights] = React.useState<number[]>([]);

  const { data, error, loading, run } = useRequest(
    async () => {
      const response = await ArticleService.homepage();
      return { articles: response, loaded: true };
    },
    { manual: true, onError: noop },
  );

  const { articles = [], loaded } = data || {};

  React.useEffect(() => {
    if (loaded) return;
    run();
  }, []);

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
    return {};
  });

  // 点击客服热线
  const onClickCustomerService = () => {
    makePhoneCall({ phoneNumber: CUSTOMER_SERVICE_TELEPHONE }).catch((error) => {
      if (isNativeCancel(error)) return;
      Toast('拨打客服热线失败，请重试');
    });
  };

  // 扫一扫
  const onClickScan = async () => {
    scanCode()
      .then(({ result }) => {
        const [, querystring] = result.split('?');
        const { path: pathname, doctorid: doctorId = '' } = qs.parse(querystring);

        if (isString(pathname) && /^\/pages\/prescription\/index/i.test(pathname)) {
          history.push(pathname);
          return;
        }

        history.push(PAGE.SEARCH, { doctorId });
      })
      .catch((error) => {
        if (isNativeCancel(error)) return;
        Toast('二维码识别失败，请重试');
      });
  };

  const onRefresherPulling = () => {
    if (loading || refresherTriggered) return;
    setRefresherTriggered(true);
  };

  const onRefresherRefresh = () => {
    if (!loaded || loading) return;
    run().finally(() => setRefresherTriggered(false));
  };

  const onRefresherRestore = () => {
    setRefresherTriggered(false);
  };

  React.useEffect(() => {
    createSelectorQuery()
      .selectAll(`.swiper`)
      .boundingClientRect((elements) => {
        if (!isArray(elements)) return;
        setHeights(elements.map(({ height }) => height));
      })
      .exec();
  }, [articles]);

  let content;

  if (loaded) {
    content = (
      <>
        <View className={s.tabs}>
          {articles.map(({ category }, index) => (
            <View
              key={`tab_${index}`}
              className={classnames(s.tab, { [s.active]: index === active })}
              onClick={() => setActive(index)}
            >
              <View>{category.name}</View>
            </View>
          ))}
        </View>

        <Swiper
          current={active}
          onChange={({ detail }) => detail.source === 'touch' && setActive(detail.current)}
          style={{
            height: (heights[active] || DEFAULT_HEIGHT) + 'PX',
          }}
        >
          {articles.map(({ category, articles: items, more }, index) => (
            <SwiperItem
              key={`swiper_${index}`}
              style={{ height: (heights[index] || DEFAULT_HEIGHT) + 'PX' }}
            >
              <View className='.swiper'>
                <View>
                  {isArray(items) && items.length > 0 ? (
                    items.map(
                      ({
                        id,
                        title,
                        picture,
                        category,
                        doctor,
                        date: createdAt,
                        like,
                        likes,
                        shares,
                      }) => (
                        <ArticleItem
                          key={id}
                          id={id}
                          title={title}
                          picture={picture}
                          label={category.name}
                          date={createdAt}
                          description={[doctor?.name, doctor?.hospitalName]}
                          like={like}
                          likes={likes}
                          shares={shares}
                          onClick={() => history.push(PAGE.ARTICLE, { articleId: id })}
                        />
                      ),
                    )
                  ) : (
                    <Empty image='record' local />
                  )}
                </View>
                {more && (
                  <View
                    className={s.more}
                    hoverClassName='clickable'
                    hoverStayTime={0}
                    onClick={() => history.push(PAGE.ARTICLE_LIST, { categoryId: category?.id })}
                  >
                    点击查看更多
                  </View>
                )}
              </View>
            </SwiperItem>
          ))}
        </Swiper>
      </>
    );
  } else if (error) {
    content = (
      <Empty
        image='record'
        description={
          <>
            数据获取失败<View>{error.message}</View>
          </>
        }
        local
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
  } else {
    content = (
      <View className={s.loader}>
        <View className={s.tabs}>
          <Skeleton row={4} rowWidth='72px' loading />
        </View>
        <View>
          <ArticleItem.Loader size={3} />
        </View>
      </View>
    );
  }

  return (
    <View className={s.wrapper}>
      <Toast.Component />
      <View className={s.header}>
        <View className={s.search} onClick={() => history.push(PAGE.SEARCH)}>
          {DOCTOR_SEARCH_PLACEHOLDER}
        </View>
        <View
          className={classnames(s.action, s.customer)}
          onClick={onClickCustomerService}
          hoverClassName='clickable-opacity'
        />
        <View
          className={classnames(s.action, s.scan)}
          onClick={onClickScan}
          hoverClassName='clickable-opacity'
        />
      </View>
      <ScrollView
        id='main'
        className={s.main}
        onRefresherPulling={onRefresherPulling}
        onRefresherRefresh={onRefresherRefresh}
        onRefresherRestore={onRefresherRestore}
        onRefresherAbort={onRefresherRestore}
        refresherTriggered={refresherTriggered}
        refresherEnabled={loaded}
        scrollY={loaded}
      >
        <View className={s.content}>
          <View className={s.entrances}>
            {ENTRANCES.map(({ key, title, path, authorize }) => (
              <View
                key={key}
                className={classnames(s.entrance, s[key])}
                onClick={() => history.push({ pathname: path, authorize })}
              >
                {title}
              </View>
            ))}
          </View>

          <View className={s.notice}>
            <View className={s.label}>
              <View>爱加健康</View>
              <View>保驾护航</View>
            </View>
            <View className={s.value}>
              <View>专业的医生服务</View>
              <View>全专家团队审核</View>
            </View>
          </View>

          {content}
          <SafeArea />
        </View>
      </ScrollView>
    </View>
  );
};
