import { useRequest } from '@/hooks';
import useSetState from '@/hooks/useSetState';
import GlobalData from '@/utils/globalData';
import history from '@/utils/history';
import Yunxin, { LEGAL_MESSAGE_KEY, LEGAL_MESSAGE_VALUE, NETCALL_TYPE } from '@/utils/im';
import * as React from 'react';
import { useQuery } from 'remax/runtime';
import { nextTick, setKeepScreenOn, showToast, vibrateLong, View } from 'remax/wechat';
import Control from './components/control';
import { CALL_TYPE } from './components/types.d';
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
  const query = useQuery<{ type: CALL_TYPE; account: string; becalling?: any }>();
  const becalling = React.useRef('becalling' in query);
  const vibrateTimer = React.useRef<NodeJS.Timeout>();
  const waitingAnsweredTimer = React.useRef<NodeJS.Timeout>();
  const [state, setState] = useSetState<State>({
    type: query.type || CALL_TYPE.VOICE,
    userinfo,
    mute: false,
    handsfree: false,
    loading: true,
  });

  const init = () => {
    if (!GlobalData.netcall) return;
    // 设置屏幕常亮
    setKeepScreenOn({ keepScreenOn: true });
    if (becalling.current) return;
    GlobalData.netcall
      .call({
        type: CALL_TYPE.VOICE === query.type ? NETCALL_TYPE.AUDIO : NETCALL_TYPE.VIDEO,
        callee: query.account,
        forceKeepCalling: true,
        pushConfig: {
          custom: JSON.stringify({ [LEGAL_MESSAGE_KEY]: LEGAL_MESSAGE_VALUE }),
        },
      })
      .catch(() => {
        showToast({ title: '呼叫失败,请重试', icon: 'none', onClose: onHangup });
      });

    waitingAnsweredTimer.current = setTimeout(() => {
      showToast({ title: '无人接听', icon: 'none', onClose: onHangup });
    }, 30 * 1000);
  };

  // 停止推流
  const stop = () => {};

  // 重连
  const reconnect = () => {};

  useRequest(Yunxin.init, { onSuccess: init });

  React.useEffect(
    () => () => {
      waitingAnsweredTimer.current && clearTimeout(waitingAnsweredTimer.current);
    },
    [],
  );

  React.useEffect(() => nextTick(init), []);

  // 被叫等待接听中设置震动
  React.useEffect(() => {
    if (state.loading && becalling.current) {
      vibrateTimer.current && clearInterval(vibrateTimer.current);
      vibrateTimer.current = setInterval(() => nextTick(vibrateLong), 1500);
    }
    return () => {
      vibrateTimer.current && clearInterval(vibrateTimer.current);
    };
  }, [state.loading]);

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
    history.back();
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
    </View>
  );
};
