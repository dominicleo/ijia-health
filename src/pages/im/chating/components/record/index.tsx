import * as React from 'react';
import { View } from 'remax/wechat';
import s from './index.less';

const ChatingRecord: React.FC = React.memo(() => {
  console.log('ChatingRecord init');
  return <View className={s.record}>ChatingRecord</View>;
});

export default ChatingRecord;
