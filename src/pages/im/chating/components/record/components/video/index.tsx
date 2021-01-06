import s from './index.less';

import * as React from 'react';

import { NimRecord, NimVideoFile } from '@/utils/im';

import ChatingRecordWrapper from '../wrapper';
import { CoverView, CoverImage, Video } from 'remax/wechat';
import ChatingContext from '../../../context';
import { CHATING_ACTION_TYPE } from '../../../types.d';
import playImage from './images/icon-play.svg';
import date from '@/utils/date';

const ChatingRecordVideo: React.FC<NimRecord<NimVideoFile>> = React.memo((props) => {
  const { chating$ } = React.useContext(ChatingContext);
  console.log(props);
  const { url, dur } = props.file! || {};
  const time = date.duration(dur).format('mm:ss');
  return (
    <CoverView
      onClick={() => chating$?.emit({ type: CHATING_ACTION_TYPE.PREVIEW, payload: props })}
    >
      <Video
        className={s.video}
        src={url}
        objectFit='cover'
        controls={false}
        showCenterPlayBtn={false}
      >
        <CoverImage className={s.play} src={playImage} />
        <CoverView className={s.duration}>{time}</CoverView>
      </Video>
    </CoverView>
  );
});

export default ChatingRecordWrapper({ children: ChatingRecordVideo });
