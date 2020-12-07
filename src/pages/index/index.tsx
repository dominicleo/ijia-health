import classnames from 'classnames';
import qs from 'qs';
import * as React from 'react';
import {
    createSelectorQuery, GenericEvent, makePhoneCall, scanCode, ScrollView, View
} from 'remax/wechat';

import ArticleItem from '@/components/article-item';
import SafeArea from '@/components/safe-area';
import Toast from '@/components/toast';
import { CUSTOMER_SERVICE_TELEPHONE } from '@/constants/common';
import PAGE from '@/constants/page';
import { useRequest } from '@/hooks';
import { ArticleService } from '@/services';
import { isArray, isNativeCancel, isString } from '@/utils';
import date from '@/utils/date';
import history, { createURL } from '@/utils/history';
import Tab from '@vant/weapp/lib/tab';
import Tabs from '@vant/weapp/lib/tabs';

import s from './index.less';

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
    path: createURL(PAGE.ARTICLE_LIST, { type: 1 }),
  },
];

export default () => {
  // const [offsetTop, setOffsetTop] = React.useState(0);
  const { data, run } = useRequest(
    async () => {
      const response = await ArticleService.homepage();
      return { articles: response, loaded: true };
    },
    { manual: true },
  );

  const { articles = [], loaded } = data || {};

  React.useEffect(() => {
    if (loaded) return;
    run();
  }, []);

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

  // const onScroll = (event: GenericEvent) => {
  //   createSelectorQuery()
  //     .select('#main')
  //     .boundingClientRect(({ top }) => {
  //       setOffsetTop(top);
  //     })
  //     .exec();
  // };

  console.log(articles);

  return (
    <View className={s.wrapper}>
      <Toast.Component />
      <View className={s.header}>
        <View className={s.search} onClick={() => history.push(PAGE.SEARCH)}>
          搜索医院、医生
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
      <ScrollView id='main' className={s.main} refresherEnabled scrollY>
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

          {loaded && isArray(articles) && (
            <Tabs
              customClass={s.articles}
              ellipsis={false}
              lineWidth={8}
              lineHeight={4}
              // offsetTop={offsetTop}
              animated
              sticky
            >
              {articles.map(({ category, articles: items, more }, index) => (
                <Tab key={`articles_${index}`} title={category.name}>
                  <View>
                    {isArray(items) &&
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
                            date={date(createdAt).format('LL')}
                            description={[doctor?.name, doctor?.hospitalName]}
                            like={like}
                            likes={likes}
                            shares={shares}
                            onClick={() => history.push(PAGE.ARTICLE, { articleId: id })}
                          />
                        ),
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
                </Tab>
              ))}
            </Tabs>
          )}
          <SafeArea />
        </View>
      </ScrollView>
    </View>
  );
};
