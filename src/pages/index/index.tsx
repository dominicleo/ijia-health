import classnames from 'classnames';
import qs from 'qs';
import * as React from 'react';
import { makePhoneCall, scanCode, ScrollView, View } from 'remax/wechat';

import Toast from '@/components/toast';
import { CUSTOMER_SERVICE_TELEPHONE } from '@/constants/common';
import PAGE from '@/constants/page';
import { isNativeCancel, isString } from '@/utils';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';

import s from './index.less';

export default () => {
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
      <ScrollView className={s.main} refresherEnabled>
        test
      </ScrollView>
    </View>
  );
};
