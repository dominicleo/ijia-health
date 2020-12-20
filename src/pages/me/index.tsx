import { CUSTOMER_SERVICE_TELEPHONE } from '@/constants/common';
import PAGE from '@/constants/page';
import history from '@/utils/history';
import * as React from 'react';
import { ScrollView, Text, View } from 'remax/wechat';

import s from './index.less';

export default () => {
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
          <View>
            <View className={s.username}>asd</View>
            <View className={s.description}>你我相识已263天</View>
          </View>
          <View className={s.avatar} hoverClassName='clickable-opacity' hoverStayTime={0} />
        </View>
        <View className={s.totals}>
          <View
            onClick={() => history.push({ pathname: PAGE.DOCTOR_FOLLOW_LIST, authorize: true })}
            hoverClassName='clickable-opacity'
            hoverStayTime={0}
          >
            <Text>关注</Text>
            <Text>293</Text>
          </View>
          <View
            onTap={() => history.push({ pathname: PAGE.ARTICLE_BOOKMARK_LIST, authorize: true })}
            hoverClassName='clickable-opacity'
            hoverStayTime={0}
          >
            <Text>收藏</Text>
            <Text>293</Text>
          </View>
        </View>
      </View>
      <ScrollView className={s.content} scrollY>
        <View className={s.container}>
          <View style={{ height: 1000 }} />
          <View className={s.slogan} />
          <View className={s.customerService}>爱加健康服务热线：{CUSTOMER_SERVICE_TELEPHONE}</View>
        </View>
      </ScrollView>
    </View>
  );
};
