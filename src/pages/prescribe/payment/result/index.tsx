import classnames from 'classnames';
import * as React from 'react';
import { useQuery } from 'remax';
import { View } from 'remax/wechat';

import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';

import s from './index.module.less';

export default () => {
  const { id } = useQuery<{ id: string }>();

  return (
    <View className={s.wrapper}>
      <View className={s.main}>
        <View className={s.statusWrapper}>
          <View className={classnames(s.status, s.success)} />
        </View>
        <View className={s.title}>支付成功</View>
      </View>

      <View className={s.action}>
        <View className={s.button}>
          <Button
            color={LINEAR_GRADIENT_PRIMARY}
            round
            block
            bindclick={() => history.replace('/pages/prescribe/order/details/index', { id })}
          >
            查看订单
          </Button>
        </View>
      </View>
    </View>
  );
};
