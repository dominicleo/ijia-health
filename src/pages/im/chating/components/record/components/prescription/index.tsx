import * as React from 'react';
import { Text, View } from 'remax/wechat';

import { isArray, JSONParse } from '@/utils';
import date from '@/utils/date';
import history from '@/utils/history';
import { NimRecord } from '@/utils/im';

import ChatingRecordWrapper from '../wrapper';
import s from './index.less';

const ChatingRecordPrescription: React.FC<NimRecord> = React.memo(({ content }) => {
  console.log(content);
  const { title, prescription_source: source, ex } = content?.data || {};
  const { prescriptionId, patientName, detail: items, time: createdAt } =
    JSONParse(ex).prescription || {};

  const onClick = () => {
    history.push(source === '1' ? '/pages/prescription/index' : '/pages/prescribe/index', {
      prescriptionId,
    });
  };

  return (
    <View className={s.wrapper} hoverClassName='clickable' onClick={onClick}>
      <View className={s.header}>
        <View>
          <View className={s.title}>{title}</View>
          <View className={s.subtitle}>共{items?.length || 0}种药品</View>
        </View>
      </View>

      <View className={s.content}>
        <View className={s.fields}>
          <View className={s.field}>
            <Text>就诊人</Text>
            <Text>{patientName}</Text>
          </View>
          <View className={s.field}>
            <Text>处方日期</Text>
            <Text>{date(createdAt * 1000).format('ll')}</Text>
          </View>
        </View>
        <View className={s.items}>
          {isArray(items) &&
            items.map(({ name, num: size }) => (
              <View className={s.item}>
                <View className={s.name}>{name}</View>
                <Text className={s.size}>x{size}</Text>
              </View>
            ))}
        </View>
      </View>
      <View className={s.footer}>查看详情</View>
    </View>
  );
});

export default ChatingRecordWrapper({ children: ChatingRecordPrescription });
