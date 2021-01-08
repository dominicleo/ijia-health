import * as React from 'react';
import { makePhoneCall, View } from 'remax/wechat';

import Ellipsis from '@/components/ellipsis';
import Empty from '@/components/empty';
import SafeArea from '@/components/safe-area';
import Toast from '@/components/toast';
import { MESSAGE } from '@/constants';
import { CUSTOMER_SERVICE_TELEPHONE } from '@/constants/common';
import PAGE from '@/constants/page';
import { useRequest } from '@/hooks';
import { HelpService } from '@/services';
import { isNativeCancel } from '@/utils';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';
import Skeleton from '@vant/weapp/lib/skeleton';

import s from './index.less';

export default () => {
  const { data, error, loading, run } = useRequest(async () => {
    const response = await HelpService.getList();
    return { list: response, loaded: true };
  });

  if (error) {
    return (
      <Empty
        image='record'
        description={
          <>
            {MESSAGE.REQUEST_FAILED}
            <View>{error.message}</View>
          </>
        }
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
  }

  let content;

  if (data?.loaded) {
    content =
      data.list.length > 0 &&
      data.list.map(({ id, title }) => (
        <View
          key={id}
          className={s.item}
          hoverClassName='clickable'
          onClick={() => history.push(PAGE.HELP, { id, title })}
        >
          <Ellipsis rows={1}>{title}</Ellipsis>
        </View>
      ));
  } else {
    content = <Skeleton row={12} loading />;
  }

  // 点击客服
  const onClickCustomerService = () => {
    makePhoneCall({ phoneNumber: CUSTOMER_SERVICE_TELEPHONE }).catch((error) => {
      if (isNativeCancel(error)) return;
      Toast('拨打客服热线失败，请重试');
    });
  };

  return (
    <View className={s.wrapper}>
      <Toast.Component />
      <View className={s.card}>
        <View className={s.title}>问题详情</View>
        <View className={s.list}>{content}</View>
        <View className={s.toolbar}>
          <Button type='default' bindclick={onClickCustomerService} block round>
            联系客服
          </Button>
          <SafeArea />
        </View>
      </View>
      <SafeArea />
    </View>
  );
};
