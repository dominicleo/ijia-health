import * as React from 'react';
import { useNativeEffect } from 'remax/runtime';
import { GenericEvent, login, removeStorage, setStorage, View } from 'remax/wechat';

import Toast from '@/components/toast';
import { COMMON, STORAGE, THEME } from '@/constants';
import { useRequest, useUpdateEffect } from '@/hooks';
import useQuery from '@/hooks/useQuery';
import { UserService } from '@/services';
import { isNativeDeny, noop } from '@/utils';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';

import s from './index.less';

const AUTHORIZE_ERROR_TEXT = '授权信息获取失败，请重试';

export default () => {
  const { redirect = '' } = useQuery();

  const code = React.useRef<string | null>(null);
  const { run, loading, error } = useRequest(UserService.authorize, {
    manual: true,
    async onSuccess({ token }) {
      try {
        await setStorage({ key: STORAGE.ACCESS_TOKEN, data: token });
        await removeStorage({ key: STORAGE.PATIENT_ID }).catch(noop);
        Toast.success({
          message: '授权登录成功',
          onClose: () => {
            if (redirect) {
              history.replace(redirect);
              return;
            }
            history.back();
          },
        });
      } catch (error) {
        Toast(AUTHORIZE_ERROR_TEXT);
      }
    },
  });

  const createAuthorizeCode = () => {
    login().then((response) => (code.current = response.code));
  };

  useNativeEffect(createAuthorizeCode, []);
  useUpdateEffect(createAuthorizeCode, [error]);

  const onSubmit = (event: GenericEvent) => {
    if (isNativeDeny(event)) return;

    const { detail } = event;

    // 用户信息字段缺失
    if (!code.current || !detail?.encryptedData || !detail?.iv) {
      Toast(AUTHORIZE_ERROR_TEXT);
      return;
    }

    run({
      code: code.current,
      encryptedData: detail.encryptedData,
      iv: detail.iv,
    });
  };

  return (
    <View className={s.wrapper}>
      <Toast.Component />
      <View className={s.logo} />
      <View className={s.name}>{COMMON.APP_NAME}</View>
      <View className={s.submit}>
        <Button
          openType='getPhoneNumber'
          bindgetphonenumber={onSubmit}
          color={THEME.LINEAR_GRADIENT_PRIMARY}
          disabled={loading}
          loading={loading}
          loadingText='正在授权登录'
          round
          block
        >
          授权手机号一键登录
        </Button>
      </View>
    </View>
  );
};
