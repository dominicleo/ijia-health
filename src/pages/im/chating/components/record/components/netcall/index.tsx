import * as React from 'react';
import { Text, View } from 'remax/wechat';
import classnames from 'classnames';

import { NETCALL_TYPE, NimRecord } from '@/utils/im';

import ChatingRecordWrapper from '../wrapper';
import s from './index.less';
import ChatingRecordBubble from '../bubble';
import date from '@/utils/date';

const ChatingRecordNetcall: React.FC<NimRecord> = React.memo((props) => {
  const { type = '', duration = 0, netcallType = 1 } = props.attach || {};
  let content;
  if (/netcallBill/.test(type)) {
    const text = netcallType === NETCALL_TYPE.AUDIO ? '聊天时长' : '通话时长';
    content = (
      <View
        className={classnames(s.bill, {
          [s.audio]: netcallType === NETCALL_TYPE.AUDIO,
          [s.video]: netcallType === NETCALL_TYPE.VIDEO,
        })}
      >
        <Text>
          {text} {date.duration(duration, 'seconds').format('mm:ss')}
        </Text>
      </View>
    );
  } else if (/netcallMiss/.test(type)) {
    content = '通话已取消';
  }

  const onClick = () => {};

  return <ChatingRecordBubble onClick={onClick}>{content}</ChatingRecordBubble>;
});

export default ChatingRecordWrapper({ children: ChatingRecordNetcall });
