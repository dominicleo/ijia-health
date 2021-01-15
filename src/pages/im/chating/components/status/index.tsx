import classnames from 'classnames';
import * as React from 'react';
import { View } from 'remax/wechat';

import {
  Order,
  ORDER_PAYMENT_STATUS,
  ORDER_PROCESS_STATUS,
  ORDER_STATUS,
} from '@/services/order/index.types.d';
import CountDown from '@vant/weapp/lib/count-down';
import Loading from '@vant/weapp/lib/loading';

import s from './index.less';

const ChatingStatus: React.FC<{
  data?: Order;
  loading?: boolean;
  onFinish?: () => void;
}> = React.memo(({ data, loading, onFinish }) => {
  const hasOrder = data?.id && data?.status;
  const isStarted = !(
    data?.status === ORDER_STATUS.NORMAL &&
    data?.paymentStatus === ORDER_PAYMENT_STATUS.PAYED &&
    data?.processStatus === ORDER_PROCESS_STATUS.UN_RECEPTION
  );
  const isProgress = isStarted && data?.expire && data.expire > 0;
  const isFinish = isStarted && data?.expire && data.expire === 0;
  const format = data?.expire && data?.expire >= 86400 ? 'HH时mm分ss秒' : 'DD天HH时mm分ss秒';

  let text;
  let extra;

  if (!hasOrder) {
    text = '未开始，下单开始咨询';
  } else if (!isStarted) {
    text = '咨询中，待医生回复后开始计时';
  } else if (isProgress) {
    text = '咨询中';
    extra = (
      <>
        <CountDown time={864000 * 1000} format={format} bindfinish={onFinish} autoStart />
        后结束咨询
      </>
    );
  } else if (isFinish) {
    text = '本次服务已结束';
  }

  return (
    <View className={classnames(s.status, { [s.finish]: isFinish })}>
      {loading ? (
        <Loading type='circular' size={14}>
          正在获取服务信息...
        </Loading>
      ) : (
        <>
          <View className={s.label}>{text}</View>
          {extra && <View className={s.extra}>{extra}</View>}
        </>
      )}
    </View>
  );
});

export default ChatingStatus;
