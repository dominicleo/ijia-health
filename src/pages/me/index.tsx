import { CUSTOMER_SERVICE_TELEPHONE } from '@/constants/common';
import PAGE from '@/constants/page';
import { useRequest, useShareMessage } from '@/hooks';
import { MinepageService } from '@/services';
import history from '@/utils/history';
import * as React from 'react';
import { Button, ScrollView, Text, View } from 'remax/wechat';
import classnames from 'classnames';

import s from './index.less';
import { usePageEvent } from 'remax/macro';
import { getCurrentPage } from '@/utils';

type Item = {
  key: string;
  title: string;
  url?: string;
};

const SERVICES: Item[] = [
  {
    key: 'prescription',
    title: '处方',
    url: PAGE.PRESCRIBE_LIST,
  },
];

const TOOLS: Item[] = [
  {
    key: 'help',
    title: '帮助中心',
    url: PAGE.ABOUT,
  },
  {
    key: 'about',
    title: '关于我们',
    url: PAGE.ABOUT,
  },
  {
    key: 'share',
    title: '分享',
  },
];

export default () => {
  const [mounted, setMounted] = React.useState(false);
  const { data, run } = useRequest(
    async () => {
      const response = await MinepageService.query();
      return { ...response, loaded: true };
    },
    { manual: true },
  );

  React.useEffect(() => {
    run().finally(() => setMounted(true));
  }, []);

  usePageEvent('onShow', () => {
    const page = getCurrentPage();
    const refer = page.__displayReporter.showReferpagepath;
    if (
      !mounted &&
      ['pages/settings/help/index.html', 'pages/settings/about/index.html'].includes(refer)
    ) {
      return;
    }
    run();
  });

  useShareMessage();

  const renderList = (data: Item[]) => {
    return (
      <View className={s.list}>
        {data.map(({ key, title, url }) => (
          <View
            key={key}
            className={s.item}
            onClick={() => url && history.push(url)}
            hoverClassName='clickable'
            hoverStayTime={0}
          >
            <View className={classnames(s.icon, s[key])} />
            {title}
            {key === 'share' && <Button openType='share' />}
          </View>
        ))}
      </View>
    );
  };

  const avatarStyle: React.CSSProperties = data?.avatar
    ? { backgroundImage: `url(${data.avatar})` }
    : {};

  let userinfo;

  if (data?.loaded) {
    userinfo = (
      <>
        <View className={s.username}>
          {data?.isAuthorize ? `你好！${data?.username}` : '未登录'}
        </View>
        <View className={s.description}>
          {data?.isAuthorize ? `你我相识已${data?.loginTimes}天` : '您还没有登录哦'}
        </View>
      </>
    );
  }

  return (
    <View className={s.wrapper}>
      <View className={s.header}>
        <View
          className={s.tips}
          onClick={() => history.push({ pathname: PAGE.MY_DOCTOR, authorize: true })}
        />

        <View
          className={s.userinfo}
          onClick={() => history.push({ pathname: PAGE.PROFILE, authorize: true })}
        >
          <View>{userinfo}</View>
          <View
            className={s.avatar}
            style={avatarStyle}
            hoverClassName='clickable-opacity'
            hoverStayTime={0}
          />
        </View>
        <View className={s.totals}>
          <View
            onClick={() => history.push({ pathname: PAGE.DOCTOR_FOLLOW_LIST, authorize: true })}
            hoverClassName='clickable-opacity'
            hoverStayTime={0}
          >
            <Text>关注</Text>
            <Text>{data?.followNumber || 0}</Text>
          </View>
          <View
            onTap={() => history.push({ pathname: PAGE.ARTICLE_BOOKMARK_LIST, authorize: true })}
            hoverClassName='clickable-opacity'
            hoverStayTime={0}
          >
            <Text>收藏</Text>
            <Text>{data?.bookmarkNumber || 0}</Text>
          </View>
        </View>
      </View>
      <ScrollView className={s.content} scrollY>
        <View className={s.container}>
          {data?.isAuthorize && renderList(SERVICES)}
          {renderList(TOOLS)}
          <View className={s.slogan} />
          <View className={s.customerService}>爱加健康服务热线：{CUSTOMER_SERVICE_TELEPHONE}</View>
        </View>
      </ScrollView>
    </View>
  );
};
