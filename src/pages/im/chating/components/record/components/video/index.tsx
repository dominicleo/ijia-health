import * as React from 'react';
import { Video, View } from 'remax/wechat';

import { NimRecord, NimVideoFile } from '@/utils/im';

import ChatingContext from '../../../context';
import { CHATING_ACTION_TYPE } from '../../../types.d';
import ChatingRecordWrapper from '../wrapper';
import s from './index.less';

const ChatingRecordVideo: React.FC<NimRecord<NimVideoFile>> = React.memo((props) => {
  const { chating$ } = React.useContext(ChatingContext);
  const { url } = props.file! || {};
  return (
    <View onClick={() => chating$?.emit({ type: CHATING_ACTION_TYPE.PREVIEW, payload: props })}>
      <Video className={s.video} src={url} objectFit='cover' controls={false} showCenterPlayBtn />
    </View>
  );
});

export default ChatingRecordWrapper({ children: ChatingRecordVideo });
