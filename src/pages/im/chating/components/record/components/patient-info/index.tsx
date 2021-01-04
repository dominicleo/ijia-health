import * as React from 'react';
import { Text, View } from 'remax/wechat';

import { NimRecord } from '@/utils/im';

import ChatingRecordBubble from '../bubble';
import ChatingRecordWrapper from '../wrapper';
import s from './index.less';

const ChatingRecordPatientInfo: React.FC<NimRecord> = React.memo((props) => {
  const { content } = props;
  const { name, sex, age } = content?.data || {};
  return (
    <ChatingRecordBubble className={s.patientinfo}>
      <View className={s.name}>{name}</View>
      {sex && <Text>{sex}</Text>}
      {age && <Text>{age}</Text>}
    </ChatingRecordBubble>
  );
});

export default ChatingRecordWrapper({ children: ChatingRecordPatientInfo });
