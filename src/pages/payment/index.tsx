import classnames from 'classnames';
import currency from 'currency.js';
import * as React from 'react';
import { useQuery } from 'remax';
import { usePageEvent } from 'remax/runtime';
import { requestPayment, requestSubscribeMessage, showModal, Text, View } from 'remax/wechat';

import Empty from '@/components/empty';
import SafeArea from '@/components/safe-area';
import Toast from '@/components/toast';
import { MESSAGE } from '@/constants';
import PAGE from '@/constants/page';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { OrderService, SubscribeService } from '@/services';
import { SUBSCRIBE_MESSAGE_TEMPLATE_TYPE } from '@/services/subscribe/index.types.d';
import { isNativeCancel, noop } from '@/utils';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';
import Checkbox from '@vant/weapp/lib/checkbox';
import CountDown from '@vant/weapp/lib/count-down';

import s from './index.less';

export default () => {
  const time = React.useRef(Date.now());
  const { orderId } = useQuery<{ orderId: string }>();
  // 获取支付信息
  const { data, error, loading, run } = useRequest(
    async () => {
      const response = await OrderService.query(orderId);
      return { ...response, loaded: true };
    },
    {
      manual: true,
      onSuccess: () => getSubscribeMessageTemplateList(),
    },
  );

  // 获取订阅消息模板
  const { data: templateIds, run: getSubscribeMessageTemplateList } = useRequest(
    () => SubscribeService.query(SUBSCRIBE_MESSAGE_TEMPLATE_TYPE.MY_DOCTOR),
    {
      onError: noop,
    },
  );

  // 订阅消息
  const handleSubscribeMessage = async () => {
    if (!templateIds) return;

    return requestSubscribeMessage({
      tmplIds: templateIds,
    }).catch(noop);
  };

  // 发起支付
  const handleRequestPayment = async () => {
    try {
      const response = await OrderService.payment(orderId);
      response.callback && (await requestPayment(response.params));
    } catch (error) {
      if (/parameter error/i.test(error.errMsg)) {
        error.errMsg = '微信支付参数错误';
      }
      return Promise.reject(error);
    }
  };

  const { run: payment, loading: submitting } = useRequest(handleRequestPayment, {
    manual: true,
  });

  usePageEvent('onShow', () => {
    if (!orderId) {
      showModal({ content: '缺少支付订单信息', showCancel: false, success: () => history.back() });
      return;
    }
    run();
  });

  const { amount = 0, paymentExpire = 0, loaded } = data || {};

  const getAmountText = (options: currency.Options) => currency(amount / 100, options).format();

  const finished = () => {
    history.replace(PAGE.PAYMENT_RESULT, { orderId });
  };

  // 倒计时完成
  const onFinish = () => {
    Toast({ message: '支付订单已超时', onClose: finished });
  };

  const onSubmit = async () => {
    if (!orderId) {
      Toast.fail('支付参数缺失，请重试');
      return;
    }

    try {
      await payment();
      await handleSubscribeMessage();
      finished();
    } catch (error) {
      if (isNativeCancel(error)) return;
      showModal({ title: MESSAGE.SYSTEM_PROMPT, content: error.message, showCancel: false });
    }
  };

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

  if (loaded) {
    content = (
      <View className={s.channel}>
        <View
          className={s.icon}
          style={{ backgroundImage: `url(https://m.ijia120.com/miniprograms/icon-wechat.png)` }}
        />
        <View className={s.name}>微信支付</View>
        <Checkbox iconSize={22} value />
      </View>
    );
  } else {
    content = Array.from(Array(3).keys()).map((_, index) => (
      <View key={`cashier_channel_item_${index}`} className={s.channel}>
        <View className={s.icon} />
        <View className={s.name} />
      </View>
    ));
  }

  return (
    <View className={classnames(s.wrapper, { [s.laoder]: !loaded })}>
      <Toast.Component />
      <View className={s.main}>
        <View className={s.amount}>
          <Text className={s.unit}>￥</Text>
          <Text className={s.value}>{getAmountText({ symbol: '' })}</Text>
        </View>
        <View className={s.countdown}>
          支付剩余时间
          {loaded && (
            <CountDown
              className={s.time}
              format='HH:mm:ss'
              time={paymentExpire - time.current}
              millisecond={false}
              autoStart
              bindfinish={onFinish}
            />
          )}
        </View>
      </View>
      <View className={s.channels}>{content}</View>

      <View className={s.submit}>
        <Button
          type='primary'
          color={LINEAR_GRADIENT_PRIMARY}
          size='large'
          bindclick={onSubmit}
          loading={submitting}
          disabled={!loaded || submitting}
          round
          block
        >
          {loaded ? getAmountText({ symbol: '￥' }) : ''} 确认支付
        </Button>
        <SafeArea />
      </View>
    </View>
  );
};
