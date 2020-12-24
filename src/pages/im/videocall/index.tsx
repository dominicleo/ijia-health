import useSetState from '@/hooks/useSetState';
import * as React from 'react';
import { useQuery } from 'remax/runtime';
import { Map, nextTick, vibrateLong, View } from 'remax/wechat';
import Control from './components/control';
import { CALL_TYPE, CALL_TYPE_VALUE } from './components/types.d';
import UserInfo from './components/userinfo';

import s from './index.less';

type UserInfo = {
  /** 用户名 */
  name: string;
  /** 头像地址 */
  avatar: string;
};

interface State {
  type: CALL_TYPE;
  /** 用户信息 */
  userinfo?: UserInfo;
  /** 静音 */
  mute: boolean;
  /** 免提 */
  handsfree: boolean;
  /** 是否等待接听中 */
  loading: boolean;
}

const userinfo = {
  name: '医生：asddqwd',
  avatar: 'https://m.ijia120.com/miniprograms/avatar-default.png',
};

export default () => {
  const query = useQuery<{ type: CALL_TYPE; becalling?: any }>();

  const becalling = React.useRef('becalling' in query);
  const vibrateTimer = React.useRef<NodeJS.Timeout>();
  const [state, setState] = useSetState<State>({
    type: query.type || CALL_TYPE.VOICE,
    userinfo,
    mute: false,
    handsfree: false,
    loading: true,
  });

  // 被叫等待接听中设置震动
  // React.useEffect(() => {
  //   if (state.loading && becalling.current) {
  //     vibrateTimer.current && clearInterval(vibrateTimer.current);
  //     vibrateTimer.current = setInterval(() => nextTick(vibrateLong), 1500);
  //   }
  //   return () => {
  //     vibrateTimer.current && clearInterval(vibrateTimer.current);
  //   };
  // }, [state.loading]);

  const onSwitchType = React.useCallback(() => {
    setState({
      type: state.type === CALL_TYPE.VIDEO ? CALL_TYPE.VOICE : CALL_TYPE.VIDEO,
    });
  }, [state.type]);

  // 接听
  const onAnswer = React.useCallback(() => {
    setState({ loading: false });
  }, []);

  // 挂断
  const onHangup = React.useCallback(() => {
    setState({ loading: true });
  }, []);

  // 切换到语音
  const onSwitchVoice = React.useCallback(() => {
    setState({ type: CALL_TYPE.VOICE, loading: false });
  }, []);

  // 切换前后摄像头
  const onSwitchCamera = React.useCallback(() => {}, []);

  // 切换静音状态
  const onMute = React.useCallback(() => {
    setState({ mute: !state.mute });
  }, [state.mute]);

  // 切换免提状态
  const onHandsfree = React.useCallback(() => {
    setState({ handsfree: !state.handsfree });
  }, [state.handsfree]);

  return (
    <View className={s.wrapper}>
      {/* <Map latitude={23.099994} longitude={113.32452} style={{ width: '100%', height: '100%' }}> */}
      <UserInfo
        type={state.type}
        name={userinfo.name}
        avatar={userinfo.avatar}
        becalling={becalling.current}
        loading={state.loading}
      />
      <Control
        type={state.type}
        mute={state.mute}
        handsfree={state.handsfree}
        becalling={becalling.current}
        loading={state.loading}
        onAnswer={onAnswer}
        onHangup={onHangup}
        onMute={onMute}
        onHandsfree={onHandsfree}
        onSwitchCamera={onSwitchCamera}
        onSwitchVoice={onSwitchVoice}
      />
      {/* </Map> */}
    </View>
  );
};
