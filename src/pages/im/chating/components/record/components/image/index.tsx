import './index.less';

import * as React from 'react';

import { NimRecord } from '@/utils/im';

import ChatingRecordBubble from '../bubble';
import ChatingRecordWrapper from '../wrapper';

const ChatingRecordImage: React.FC<NimRecord> = React.memo(({ text }) => {
  return <ChatingRecordBubble>{text}</ChatingRecordBubble>;
});

export default ChatingRecordWrapper({ children: ChatingRecordImage });
