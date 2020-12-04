import classnames from 'classnames';
import currency from 'currency.js';
import * as React from 'react';
import { usePageEvent } from 'remax/runtime';
import {
    login, requestPayment, requestSubscribeMessage, showModal, Text, View
} from 'remax/wechat';

import SafeArea from '@/components/safe-area';
import Toast from '@/components/toast';
import { MESSAGE } from '@/constants';
import PAGE from '@/constants/page';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useQuery, useRequest, useUpdateEffect } from '@/hooks';
import { CashierService, SubscribeService } from '@/services';
import { CashierSubmitParams } from '@/services/cashier/index.types';
import { first, isArray, isNativeCancel, noop } from '@/utils';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';
import Checkbox from '@vant/weapp/lib/checkbox';
import CountDown from '@vant/weapp/lib/count-down';

import s from './index.less';

export default () => {
  const { orderId, redirect, subscribeKey } = useQuery();
  const code = React.useRef<string | null>();
  const [channel, setChannel] = React.useState<string | null>();
  // 获取支付信息
  const { data, run } = useRequest(
    async (id) => {
      const response = await CashierService.query(id);
      return { ...response, loaded: true };
    },
    {
      manual: true,
      onSuccess({ channels }) {
        const firstChannel = first(channels);
        firstChannel && setChannel(firstChannel.code);
      },
      initialData: {
        amount: 0,
        expire: 0,
        channels: [],
        token: '',
        loaded: false,
      },
    },
  );

  // 获取订阅消息模板
  const { data: templateIds } = useRequest(
    () => (subscribeKey ? SubscribeService.query(subscribeKey) : Promise.resolve()),
    {
      onError: noop,
    },
  );

  // 获取订阅消息模板
  const handleSubscribeMessage = async () => {
    if (!templateIds) return;

    return new Promise((resolve) =>
      requestSubscribeMessage({
        tmplIds: templateIds,
      }).finally(resolve),
    );
  };

  // 获取微信支付参数
  const handleRequestPayment = async (params: CashierSubmitParams) => {
    const response = await CashierService.submit(params);
    await requestPayment(response.params).catch((event) => {
      let message = event.errMsg;
      if (isNativeCancel(event)) return;
      if (/parameter error/i.test(message)) {
        message = '微信支付参数错误';
      }
      showModal({ title: MESSAGE.SYSTEM_PROMPT, content: message, showCancel: false });
      return Promise.reject(new Error(message));
    });

    return response;
  };

  const { run: payment, loading: submitting, error } = useRequest(handleRequestPayment, {
    manual: true,
  });

  const createAuthorizeCode = () => {
    login().then((response) => (code.current = response.code));
  };

  React.useEffect(createAuthorizeCode, []);
  useUpdateEffect(createAuthorizeCode, [error]);

  usePageEvent('onShow', () => {
    if (!orderId) {
      showModal({ content: '缺少支付订单信息', showCancel: false, success: () => history.back() });
      return;
    }
    run(orderId);
  });

  const { amount = 0, expire = 0, token, channels, loaded } = data || {};

  const time = expire - Date.now();

  const getAmountText = (options: currency.Options) => currency(amount / 100, options).format();

  const onSubmit = async () => {
    if (!channel) {
      Toast('请选择支付方式');
      return;
    }

    if (!orderId || !token || !channel || !code.current) {
      Toast.fail('支付参数缺失，请重试');
      return;
    }

    const { id } = await payment({ orderId, token, channel, code: code.current });

    await handleSubscribeMessage();

    // 跳转到支付结果页
    history.replace(PAGE.CASHIER_RESULT, { id, redirect });
  };

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
          <CountDown className={s.time} time={time} />
        </View>
      </View>
      <View className={s.channels}>
        {loaded
          ? isArray(channels) &&
            channels.map(({ code, name, icon }) => (
              <View key={code} className={s.channel} onClick={() => setChannel(code)}>
                <View className={s.icon} style={icon ? { backgroundImage: `url(${icon})` } : {}} />
                <View className={s.name}>{name}</View>
                <Checkbox iconSize={22} value={code === channel} />
              </View>
            ))
          : Array.from(Array(3).keys()).map((_, index) => (
              <View key={`cashier_channel_item_${index}`} className={s.channel}>
                <View className={s.icon} />
                <View className={s.name} />
              </View>
            ))}
      </View>

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