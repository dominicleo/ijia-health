import classnames from 'classnames';
import * as React from 'react';
import { useQuery } from 'remax';
import { requestPayment, Text, View } from 'remax/wechat';

import Empty from '@/components/empty';
import Toast from '@/components/toast';
import PAGE from '@/constants/page';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { PrescriptionService } from '@/services';
import { isArray, isNativeCancel, isRelease } from '@/utils';
import { AuthorizeError } from '@/utils/error';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';
import Checkbox from '@vant/weapp/lib/checkbox';

import s from './index.module.less';

export default () => {
  const { id, price } = useQuery<{ id: string; price: string }>();
  // 页面数据加载状态
  const [loaded, setPageCompleted] = React.useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = React.useState(null);

  const { data, error, loading, run } = useRequest(
    () => PrescriptionService.paymentChannels(isRelease ? 'PRESCRIPTION_PAY' : 'TEST'),
    {
      onSuccess(response) {
        !loaded && setPageCompleted(true);
        if (!paymentMethod) {
          const firstPaymentMethod = response.find((_: any, index: number) => index === 0);
          firstPaymentMethod && setPaymentMethod(firstPaymentMethod.channel);
        }
      },
    },
  );

  // // 获取订阅消息模板
  // const { data: templateIds } = useSubscribeMessageTemplateList('PaySuccAndFinish', {
  //   onError() {},
  // });

  const { loading: submitting, run: payment } = useRequest(
    async () => {
      const response = await PrescriptionService.payment({
        payChannel: paymentMethod,
        platform: 'WeApp',
        prescriptionId: id,
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
    if (!paymentMethod) {
      Toast('请选择支付类型');
      return;
    }
    payment();
  };

  const finished = () => {
    history.replace('/pages/prescription/payment/result/index', { id });
  };

  const requestPaymentCallback = () => {
    Toast.clear();
    finished();
    // if (!(isArray(templateIds) && templateIds.length)) return finished();
    // requestSubscribeMessage({ tmplIds: templateIds }).finally(finished);
  };

  const onRequestPayment = async (params: any = {}) => {
    const {
      appId,
      prepayId,
      nonceStr,
      timestamp: timeStamp,
      sign: paySign,
      wePaySignType: signType,
    } = params;

    Toast.loading({ duration: 0 });

    await requestPayment({
      appId,
      timeStamp,
      nonceStr,
      package: prepayId,
      signType,
      paySign,
    })
      .then(requestPaymentCallback)
      .catch((error) => {
        if (isNativeCancel(error)) return;
        Toast('支付失败，请重试');
      })
      .finally(() => Toast.clear());
  };

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
        {isArray(data) &&
          data.map(({ id, name, logo, channel }) => (
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
