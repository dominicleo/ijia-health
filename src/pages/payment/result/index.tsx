import classnames from 'classnames';
import * as React from 'react';
import { usePageEvent } from 'remax/runtime';
import { showModal, View } from 'remax/wechat';

import PAGE from '@/constants/page';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { OrderService } from '@/services';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';

import s from './index.less';
import { useQuery } from 'remax';
import { ORDER_PAYMENT_STATUS, ORDER_STATUS } from '@/services/order/index.types.d';

enum STATUS_TEXT {
  CANCELED = '交易关闭',
  PENDING = '正在查询支付结果',
  PAYED = '支付成功',
  FAILED = '支付失败',
}

export default () => {
  const { orderId } = useQuery<{ orderId: string }>();
  const timer = React.useRef<NodeJS.Timeout | null>();
  const { data, run } = useRequest(
    async () => {
      const response = await OrderService.query(orderId);
      return { ...response, loaded: true };
    },
    {
      manual: true,
    },
  );

  React.useEffect(() => {
    return () => {
      timer.current && clearTimeout(timer.current);
    };
  }, []);

  usePageEvent('onShow', () => {
    if (!orderId) {
      showModal({ content: '缺少支付订单信息', showCancel: false, success: () => history.back() });
      return;
    }
    timer.current = setTimeout(() => {
      run();
    }, 3500);
  });

  const onClick = () => {
    history.back();
  };

  const { status, paymentStatus, goodsName, createdAt, loaded } = data || {};

  const isPayment = ORDER_PAYMENT_STATUS.PAYED === paymentStatus;
  const isNormal = ORDER_STATUS.NORMAL === status;
  const isCancel = ORDER_STATUS.CANCEL === status;

  let title;

  if (loaded) {
    title = isCancel ? STATUS_TEXT.FAILED : STATUS_TEXT.PAYED;
  } else {
    title = STATUS_TEXT.PENDING;
  }

  return (
    <View className={s.wrapper}>
      <View className={s.main}>
        <View className={s.statusWrapper}>
          <View
            className={classnames(s.status, {
              [s.success]: isNormal && isPayment,
              [s.fail]: isCancel,
            })}
          />
        </View>
        <View className={s.statusText}>
          <View className={s.title}>{title}</View>
          {isCancel && <View className={s.message}>支付超时，请您重新下单</View>}
        </View>
      </View>
      {loaded && (
        <>
          <View className={s.fields}>
            <View className={s.field}>
              <View className={s.label}>订单编号</View>
              <View className={s.value}>{orderId}</View>
            </View>
            <View className={s.field}>
              <View className={s.label}>创建时间</View>
              <View className={s.value}>{createdAt}</View>
            </View>

            <View className={s.field}>
              <View className={s.label}>订单类型</View>
              <View className={s.value}>{goodsName}</View>
            </View>
          </View>
          <View className={s.action}>
            <Button color={LINEAR_GRADIENT_PRIMARY} bindclick={onClick} round block>
              立即开始
            </Button>
            <Button
              type='default'
              bindclick={() => history.push(PAGE.INDEX, null, { reLaunch: true })}
              round
              block
            >
              返回首页
            </Button>
          </View>
        </>
      )}
    </View>
  );
};
