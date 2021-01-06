import s from './index.less';

import * as React from 'react';

import { NimImageFile, NimRecord } from '@/utils/im';

import ChatingRecordWrapper from '../wrapper';
import { Image } from 'remax/wechat';
import ChatingContext from '../../../context';
import { CHATING_ACTION_TYPE } from '../../../types.d';

const ChatingRecordImage: React.FC<NimRecord<NimImageFile>> = React.memo((props) => {
  const { chating$ } = React.useContext(ChatingContext);
  const { url } = props.file || {};
  return (
    <Image
      className={s.picture}
      src={url}
      mode='widthFix'
      onClick={() => chating$?.emit({ type: CHATING_ACTION_TYPE.PREVIEW, payload: props })}
      lazyLoad
    />
  );
});

export default ChatingRecordWrapper({ children: ChatingRecordImage });
