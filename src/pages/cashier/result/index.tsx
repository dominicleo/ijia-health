import classnames from 'classnames';
import * as React from 'react';
import { usePageEvent } from 'remax/runtime';
import { showModal, View } from 'remax/wechat';

import PAGE from '@/constants/page';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { CashierService } from '@/services';
import { CASHIER_ORDER_STATUS, CASHIER_STATUS } from '@/services/cashier/index.types.d.ts';
import date from '@/utils/date';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';

import s from './index.less';
import { useQuery } from 'remax';

const CASHIER_STATUS_TEXT = {
  [CASHIER_STATUS.CANCELED]: '交易关闭',
  [CASHIER_STATUS.PENDING]: '正在查询支付结果',
  [CASHIER_STATUS.PAYED]: '支付成功',
  [CASHIER_STATUS.FAILED]: '支付失败',
};

export default () => {
  const { id, redirect, delta } = useQuery();
  const timer = React.useRef<NodeJS.Timeout | null>();
  const { data, run } = useRequest(
    async (params) => {
      const response = await CashierService.result(params);
      return { ...response, loaded: true };
    },
    {
      manual: true,
      initialData: {
        orderId: '',
        createdAt: 0,
        paymentTime: 0,
        status: CASHIER_STATUS.PENDING,
        orderStatus: CASHIER_ORDER_STATUS.CREATED,
        loaded: false,
      },
    },
  );

  React.useEffect(() => {
    return () => {
      timer.current && clearTimeout(timer.current);
    };
  }, []);

  usePageEvent('onShow', () => {
    if (!id) {
      showModal({ content: '缺少支付订单信息', showCancel: false, success: () => history.back() });
      return;
    }
    timer.current = setTimeout(() => {
      run(id);
    }, 3500);
  });

  const { orderId, createdAt, paymentTime, status, loaded } = data || {};

  const onClick = () => {
    if (redirect) {
      history.replace(redirect).catch(() => {
        history.back();
      });
      return;
    }

    history.back(delta ? parseInt(delta) : 1);
  };

  return (
    <View className={s.wrapper}>
      <View className={s.main}>
        <View className={s.statusWrapper}>
          <View
            className={classnames(s.status, {
              [s.success]: status === CASHIER_STATUS.PAYED,
              [s.fail]: status && [CASHIER_STATUS.CANCELED, CASHIER_STATUS.FAILED].includes(status),
            })}
          />
        </View>
        <View className={s.statusText}>
          {status && <View className={s.title}>{CASHIER_STATUS_TEXT[status]}</View>}
        </View>
      </View>
      {loaded && status !== CASHIER_STATUS.PENDING && (
        <View className={s.fields}>
          <View className={s.field}>
            <View className={s.label}>订单编号</View>
            <View className={s.value}>{orderId}</View>
          </View>
          <View className={s.field}>
            <View className={s.label}>创建时间</View>
            <View className={s.value}>{date(createdAt).format('L LTS')}</View>
          </View>
          {status === CASHIER_STATUS.PAYED && (
            <View className={s.field}>
              <View className={s.label}>支付时间</View>
              <View className={s.value}>{date(paymentTime).format('L LTS')}</View>
            </View>
          )}
        </View>
      )}
      {loaded && (
        <View className={s.action}>
          <Button color={LINEAR_GRADIENT_PRIMARY} bindclick={onClick} round block>
            确认
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
      )}
    </View>
  );
};
