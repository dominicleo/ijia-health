import classnames from 'classnames';
import currency from 'currency.js';
import * as React from 'react';
import { useQuery } from 'remax';
import { usePageEvent } from 'remax/runtime';
import {
  login,
  requestPayment,
  requestSubscribeMessage,
  showModal,
  Text,
  View,
} from 'remax/wechat';

import Empty from '@/components/empty';
import SafeArea from '@/components/safe-area';
import Toast from '@/components/toast';
import { MESSAGE } from '@/constants';
import PAGE from '@/constants/page';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest, useUpdateEffect } from '@/hooks';
import { CashierService, SubscribeService } from '@/services';
import { CashierSubmitParams } from '@/services/cashier/index.types';
import { first, isArray, isNativeCancel, noop } from '@/utils';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';
import Checkbox from '@vant/weapp/lib/checkbox';
import CountDown from '@vant/weapp/lib/count-down';

import s from './index.less';

export default () => {
  const { orderId, redirect, subscribeKey, delta } = useQuery();
  const time = React.useRef(Date.now());
  const code = React.useRef<string | null>();
  const [channel, setChannel] = React.useState<string | null>();
  // 获取支付信息
  const { data, error, loading, run } = useRequest(
    async (id) => {
      const response = await CashierService.query(id);
      return { ...response, loaded: true };
    },
    {
      manual: true,
      onSuccess({ channels, loaded }) {
        const firstChannel = first(channels);
        firstChannel && setChannel(firstChannel.code);
        loaded && getSubscribeMessageTemplateList();
      },
    },
  );

  // 获取订阅消息模板
  const { data: templateIds, run: getSubscribeMessageTemplateList } = useRequest(
    () => (subscribeKey ? SubscribeService.query(subscribeKey) : Promise.resolve()),
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
  const handleRequestPayment = async (params: CashierSubmitParams) => {
    try {
      const response = await CashierService.submit(params);
      await requestPayment(response.params);
      return response;
    } catch (error) {
      if (/parameter error/i.test(error.errMsg)) {
        error.errMsg = '微信支付参数错误';
      }
      return Promise.reject(error);
    }
  };

  const { run: payment, loading: submitting, error: requestPaymentError } = useRequest(
    handleRequestPayment,
    {
      manual: true,
    },
  );

  const createAuthorizeCode = () => {
    login().then((response) => (code.current = response.code));
  };

  React.useEffect(createAuthorizeCode, []);
  useUpdateEffect(createAuthorizeCode, [requestPaymentError]);

  usePageEvent('onShow', () => {
    if (!orderId) {
      showModal({ content: '缺少支付订单信息', showCancel: false, success: () => history.back() });
      return;
    }
    run(orderId);
  });

  const { amount = 0, expire = 0, token, channels, loaded } = data || {};
  const getAmountText = (options: currency.Options) => currency(amount / 100, options).format();

  const onFinish = () => {
    Toast({ message: '支付订单已超时', onClose: () => history.back() });
  };

  const onSubmit = async () => {
    if (!channel) {
      Toast('请选择支付方式');
      return;
    }

    if (!orderId || !token || !channel || !code.current) {
      Toast.fail('支付参数缺失，请重试');
      return;
    }

    try {
      const { id } = await payment({ orderId, token, channel, code: code.current });
      await handleSubscribeMessage();
      // 跳转到支付结果页
      history.replace(PAGE.CASHIER_RESULT, { id, redirect, delta });
    } catch (error) {
      if (isNativeCancel(error)) return;
      showModal({ title: MESSAGE.SYSTEM_PROMPT, content: error.message, showCancel: false });
    }
  };

  const onContactError = (event: any) => {
    Toast(event.detail.errMsg);
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
    content =
      isArray(channels) && channels.length > 0 ? (
        channels.map(({ code, name, icon }) => (
          <View key={code} className={s.channel} onClick={() => setChannel(code)}>
            <View className={s.icon} style={icon ? { backgroundImage: `url(${icon})` } : {}} />
            <View className={s.name}>{name}</View>
            <Checkbox iconSize={22} value={code === channel} />
          </View>
        ))
      ) : (
        <Empty description='支付渠道为空' local>
          <Button type='primary' size='small' openType='contact' binderror={onContactError} round>
            联系客服
          </Button>
        </Empty>
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
            <View className={s.time}>
              <CountDown
                format='HH:mm:ss'
                time={expire - time.current}
                millisecond={false}
                autoStart
                bindfinish={onFinish}
              />
            </View>
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
          disabled={!loaded || submitting || !channel}
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
