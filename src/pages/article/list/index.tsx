import * as React from 'react';
import { useNativeEffect } from 'remax';
import { hideHomeButton, View } from 'remax/wechat';

import s from './index.less';

export default () => {
  return (
    <View className={s.wrapper}>
      <View className={s.header}></View>
      <View className={s.main}></View>
    </View>
  );
};
