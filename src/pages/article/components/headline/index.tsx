import * as React from 'react';
import { View } from 'remax/wechat';

import s from './index.less';

const Headline: React.FC<{ title: string; extra?: React.ReactNode }> = React.memo(
  ({ title, extra }) => {
    return (
      <View className={s.headline}>
        <View className={s.title}>{title}</View> {extra && <View className={s.extra}>{extra}</View>}
      </View>
    );
  },
);

export default Headline;
