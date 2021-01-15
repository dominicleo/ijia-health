import * as React from 'react';
import { Text, View } from 'remax/wechat';

import { NimRecord } from '@/utils/im';

import ChatingContext from '../../../context';
import { CHATING_ACTION_TYPE } from '../../../types.d';
import { MESSAGE_RECORD_CUSTOM_TYPE } from '../types.d';
import ChatingRecordWrapper from '../wrapper';
import s from './index.less';

const ChatingRecordNotice: React.FC<Pick<NimRecord, 'content'>> = React.memo(({ content }) => {
  const { chating$ } = React.useContext(ChatingContext);
  const data = content?.data || {};

  const onClick = () => {
    // 点击去支付
    if (content?.type === MESSAGE_RECORD_CUSTOM_TYPE.SETMEAL && content?.data?.infoType === '1') {
      chating$?.emit({ type: CHATING_ACTION_TYPE.PAYMENT });
      return;
    }
  };

  return (
    <View className={s.notice} onClick={onClick}>
      {data.desc}
      {!!data?.info && <Text style={{ color: data?.textColor }}>{data?.info}</Text>}
    </View>
  );
});

export default ChatingRecordWrapper({ header: ChatingRecordNotice });
