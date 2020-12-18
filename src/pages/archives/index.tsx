import * as React from 'react';
import { View } from 'remax/wechat';

import Toast from '@/components/toast';
import { useShareMessage } from '@/hooks';
import Button from '@vant/weapp/lib/button';

import s from './index.less';

export default () => {
  useShareMessage();
  const onContactError = (event: any) => {
    Toast(event.detail.errMsg);
  };

  return (
    <View className={s.wrapper}>
      <Toast.Component />
      <View className={s.logo} />
      <View className={s.apps} />
      <View className={s.button}>
        <Button type='primary' openType='contact' binderror={onContactError} block>
          点击进入，回复“爱加”下载APP
        </Button>
      </View>
      <View className={s.tips}> 在客服会话中回复“爱加”即可下载「爱加健康APP」</View>
    </View>
  );
};
