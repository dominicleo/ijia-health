import classnames from 'classnames';
import * as React from 'react';
import { useQuery } from 'remax';
import { requestPayment, Text, View } from 'remax/wechat';

import Empty from '@/components/empty';
import Toast from '@/components/toast';
import PAGE from '@/constants/page';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { PrescribeService } from '@/services';
import { isNativeCancel } from '@/utils';
import { AuthorizeError } from '@/utils/error';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';
import Checkbox from '@vant/weapp/lib/checkbox';

import s from './index.module.less';

const METHODS = [
  {
    name: '微信支付',
    logo: 'https://m.ijia120.com/miniprograms/icon-wechat.png',
    channel: 'WeChatPay',
  },
];

export default () => {
  const { id } = useQuery<{ id: string }>();
  // 页面数据加载状态
  const [loaded, setPageCompleted] = React.useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = React.useState<string | null>('WeChatPay');

  const { data, error, loading, run } = useRequest(
    async () => {
      const response = await PrescribeService.orderDetails(id);
      return response;
    },
    {
      onSuccess(response) {
        !loaded && setPageCompleted(true);
      },
    },
  );

  const { loading: submitting, run: payment } = useRequest(
    async () => {
      const { openId } = await PrescribeService.getOpenId();
      const response = await PrescribeService.payment({
        name: '123',
        desc: 'test',
        payOrder: data.prescriptionId,
        payType: paymentMethod,
        plateForm: 'WeApp',
        price: data.orderTotal,
        openId,
      });
      await onRequestPayment(response);
    },
    {
      manual: true,
      onSuccess() {},
      onError(error: any) {
        if (AuthorizeError.is(error)) {
          history.push(PAGE.AUTHORIZE);
          return;
        }

        Toast(error.message);
      },
    },
  );

  if (error) {
    return (
      <Empty image='record' description={error.message}>
        <Button
          type='primary'
          size='small'
          bindclick={run}
          loading={loading}
          disabled={loading}
          round
        >
          重新加载
        </Button>
      </Empty>
    );
  }
  const onPayment = () => {
    if (submitting) return;
    if (!paymentMethod) {
      Toast('请选择支付类型');
      return;
    }
    payment();
  };

  const finished = () => {
    history.replace('/pages/prescribe/payment/result/index', { id });
  };

  const requestPaymentCallback = () => {
    finished();
  };

  const onRequestPayment = async (params: any = {}) => {
    const { appId, prepayId, nonceStr, timestamp, sign: paySign, wePaySignType } = params;

    Toast.loading({ duration: 0 });

    await requestPayment({
      appId,
      timeStamp: timestamp,
      nonceStr,
      package: prepayId,
      signType: wePaySignType,
      paySign,
    })
      .then(requestPaymentCallback)
      .catch((error) => {
        if (isNativeCancel(error)) return;
        Toast('支付失败，请重试');
      })
      .finally(() => Toast.clear());
  };

  const { orderTotal: price }: any = data || {};

  return (
    <View className={classnames(s.wrapper, { [s.hidden]: !loaded })}>
      <Toast.Component />
      <View className={s.main}>
        <View className={s.amount}>
          <View className={s.unit}>￥</View>
          <Text>{price}</Text>
        </View>
      </View>
      <View className={s.list}>
        {METHODS.map(({ name, logo, channel }) => (
          <View
            key={`payment_method_${id}`}
            className={s.item}
            wechat-hoverClass='clickable'
            onTap={() => setPaymentMethod(channel)}
          >
            <View className={s.icon} style={logo ? { backgroundImage: `url(${logo})` } : {}} />
            <View className={s.content}>{name}</View>
            <View className={s.extra}>
              <Checkbox custom-class={s.checkbox} size={22} value={paymentMethod === channel} />
            </View>
          </View>
        ))}
      </View>

      <View className={s.toolbar}>
        <Button
          color={LINEAR_GRADIENT_PRIMARY}
          round
          block
          disabled={submitting}
          loading={submitting}
          loading-text='正在支付，请稍后'
          loading-size={22}
          bindclick={onPayment}
        >
          <View className={s.amountText}>
            <Text>￥</Text>
            {price}
          </View>
          确认支付
        </Button>
      </View>
    </View>
  );
};
