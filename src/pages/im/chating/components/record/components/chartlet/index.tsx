import * as React from 'react';
import { Image } from 'remax/wechat';

import { NimRecord } from '@/utils/im';

import EMOJI_CONFIG from '../../../emoji/data';
import ChatingRecordWrapper from '../wrapper';
import s from './index.less';

const ChatingRecordChartLet: React.FC<NimRecord> = React.memo(({ content }) => {
  const { chartlet } = content?.data || {};
  const source = EMOJI_CONFIG.map.get(chartlet);

  return <Image className={s.chartlet} src={source} lazyLoad />;
});

export default ChatingRecordWrapper({ children: ChatingRecordChartLet });
