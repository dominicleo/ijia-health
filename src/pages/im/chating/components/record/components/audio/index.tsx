import classnames from 'classnames';
import * as React from 'react';
import { createInnerAudioContext, showToast, Text, View } from 'remax/wechat';

import date from '@/utils/date';
import { NIM_MESSAGE_FLOW, NIM_MESSAGE_STATUS, NimAudioFile, NimRecord } from '@/utils/im';
import Loading from '@vant/weapp/lib/loading';

import ChatingContext from '../../../context';
import { CHATING_ACTION_TYPE } from '../../../types.d';
import ChatingRecordBubble from '../bubble';
import ChatingRecordWrapper from '../wrapper';
import s from './index.less';

const ChatingRecordAudio: React.FC<NimRecord<NimAudioFile>> = React.memo((props) => {
  const { chating$ } = React.useContext(ChatingContext);
  const { flow, file, status } = props;
  const { url, mp3Url, dur = 0, ext } = file || {};
  const [playing, setPlaying] = React.useState(false);
  const audio = React.useRef(createInnerAudioContext());

  const loading = status === NIM_MESSAGE_STATUS.SENDING;
  const isSent = flow === NIM_MESSAGE_FLOW.OUT;
  const duration = ((dur / 1000) << 1) >> 1;
  const time = date.duration(duration, 'seconds').format(dur > 60 * 1000 ? `m's''` : `s''`);
  const className = classnames(s.audio, {
    [s.loading]: loading,
    [s.playing]: playing,
    [s.received]: !isSent,
    [s.sent]: isSent,
    [s.small]: duration >= 15 && duration < 30,
    [s.middle]: duration >= 30 && duration < 45,
    [s.large]: duration >= 45,
  });

  chating$?.useSubscription((action) => {
    if (action.type !== CHATING_ACTION_TYPE.PLAYAUDIO) return;
    // 如订阅不是当前音频且正在播放则暂停播放
    action.payload?.md5 !== file?.md5 && playing && audio.current.pause();
  });

  const onPlay = () => {
    setPlaying(true);
  };
  const onPause = () => {
    setPlaying(false);
  };
  // const onStop = () => {
  //   setPlaying(false);
  // };
  // const onEnded = () => {
  //   setPlaying(false);
  // };

  const onClick = () => {
    if (status !== NIM_MESSAGE_STATUS.SUCCESS) return;
    if (playing) return audio.current.pause();
    audio.current.play();
    chating$?.emit({ type: CHATING_ACTION_TYPE.PLAYAUDIO, payload: props.file! });
  };

  React.useEffect(() => {
    // 订阅音频事件
    audio.current.src = ext === 'mp3' ? url! : mp3Url!;
    audio.current.onPlay(onPlay);
    audio.current.onPause(onPause);
    audio.current.onStop(onPause);
    audio.current.onEnded(onPause);
    audio.current.onError((error) => {
      showToast({ title: error.errMsg, icon: 'none', mask: true });
    });
    return () => {
      // 取消订阅音频事件并销毁
      audio.current.offPlay(onPlay);
      audio.current.offPause(onPause);
      audio.current.offStop(onPause);
      audio.current.offEnded(onPause);
      audio.current.stop();
      audio.current.destroy();
    };
  }, []);

  return (
    <ChatingRecordBubble
      className={className}
      onClick={onClick}
      hoverClassName={!loading ? 'clickable-opacity' : 'none'}
      hoverStayTime={0}
    >
      {loading ? (
        <Loading type='spinner' size={16} />
      ) : (
        <>
          <Text>{time}</Text>
          <View className={s.voice} />
        </>
      )}
    </ChatingRecordBubble>
  );
});

export default ChatingRecordWrapper({ children: ChatingRecordAudio });
