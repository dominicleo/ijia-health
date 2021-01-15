import classnames from 'classnames';
import * as React from 'react';
import { useQuery } from 'remax';
import { View } from 'remax/wechat';
import { unstable_batchedUpdates } from 'remax/runtime';
import { Input } from 'remax/wechat';

import Toast from '@/components/toast';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { PrescriptionService } from '@/services';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';
import Countdown from '@vant/weapp/lib/count-down';

import s from './index.module.less';

export default () => {
  const { id } = useQuery<{ id: string }>();
  // 页面数据加载状态
  const [phoneNumber, setPhoneNumber] = React.useState<string>('');
  const [phoneNumberFocus, setPhoneNumberFocus] = React.useState<boolean>(false);
  const [captcha, setCaptcha] = React.useState<string>('');
  const [captchaFocus, setCaptchaFocus] = React.useState<boolean>(false);
  const [countdown, setCountdown] = React.useState<number | null>(null);
  const [complete, setComplete] = React.useState(false);

  const SEND_CAPTCHA_TEXT = countdown === 0 ? '重发验证码' : '发送验证码';

  const { run: sendCaptcha, loading: sendCaptchaLoading } = useRequest(
    (params) => PrescriptionService.sendCaptcha(params),
    {
      manual: true,
      onSuccess() {
        Toast('验证码已发送');
        unstable_batchedUpdates(() => {
          setCountdown(60000);
          setCaptchaFocus(true);
        });
      },
    },
  );

  const { run: register, loading } = useRequest((params) => PrescriptionService.register(params), {
    manual: true,
    onSuccess() {
      Toast('提交成功');
      setComplete(true);
    },
  });

  const goHome = () => {
    history.push('/pages/index/index', null, { reLaunch: true });
  };

  const onSendCaptcha = () => {
    if (sendCaptchaLoading || countdown) return;
    if (!/[0-9]{11}/.test(phoneNumber)) {
      Toast('请输入正确的手机号');
      setPhoneNumberFocus(true);
      return;
    }
    Toast.loading({ duration: 0 });
    sendCaptcha({
      mobile: phoneNumber,
      platform: 'WeApp',
      prescriptionId: id,
    });
  };

  const onSubmit = () => {
    if (loading) return;
    if (complete) return goHome();
    if (!/[0-9]{11}/.test(phoneNumber)) {
      Toast('请输入正确的手机号');
      setPhoneNumberFocus(true);
      return;
    }
    if (!captcha) {
      Toast('请输入验证码');
      setCaptchaFocus(true);
      return;
    }
    register({
      mobile: phoneNumber,
      opt: captcha,
      platform: 'WeApp',
      prescriptionId: id,
    });
  };

  return (
    <View className={s.wrapper}>
      <Toast.Component />
      <View className={s.main}>
        <View className={s.title}>请输入患者信息</View>
        <View className={s.fields}>
          <View className={s.field}>
            <View className={classnames(s.icon, s.phone)} />
            <Input
              value={phoneNumber}
              focus={phoneNumberFocus}
              type='number'
              placeholder='请输入联系人手机号码'
              wechat-placeholder-class={s.placeholder}
              onInput={(event) => setPhoneNumber(event.detail.value)}
              maxlength={11}
            />
          </View>
          <View className={s.field}>
            <View className={classnames(s.icon, s.password)} />
            <Input
              value={captcha}
              focus={captchaFocus}
              placeholder='请输入验证码'
              wechat-placeholder-class={s.placeholder}
              onInput={(event) => setCaptcha(event.detail.value)}
              maxlength={6}
            />
            <View
              className={classnames(s.captcha, { [s.disabled]: countdown })}
              onTap={onSendCaptcha}
            >
              {countdown ? (
                <Countdown
                  time={countdown}
                  format='ss秒后重发'
                  bindfinish={() => setCountdown(0)}
                  auto-start
                />
              ) : (
                SEND_CAPTCHA_TEXT
              )}
            </View>
          </View>
        </View>
      </View>
      <Button
        color={LINEAR_GRADIENT_PRIMARY}
        round
        block
        customClass={s.button}
        disabled={!(phoneNumber && captcha)}
        bindclick={onSubmit}
      >
        {complete ? (
          <View className={s.gohome}>
            回到首页（
            <Countdown time={5000} format='ss' bindfinish={goHome} auto-start />）
          </View>
        ) : (
          '提交'
        )}
      </Button>
    </View>
  );
};
