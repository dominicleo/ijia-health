import { useRequest } from '@/hooks';
import useSetState from '@/hooks/useSetState';
import { noop } from '@/utils';
import GlobalData from '@/utils/globalData';
import history from '@/utils/history';
import {
  LEGAL_MESSAGE_KEY,
  LEGAL_MESSAGE_VALUE,
  NETCALL_MODE,
  NETCALL_TYPE,
  NETCALL_TYPE_VALUE,
} from '@/utils/im';
import * as React from 'react';
import { usePageEvent, useQuery } from 'remax/runtime';
import {
  createLivePusherContext,
  nextTick,
  setKeepScreenOn,
  showToast,
  vibrateLong,
  View,
} from 'remax/wechat';
import Control from './components/control';
import UserInfo from './components/userinfo';

import s from './index.less';

type UserInfo = {
  /** 用户名 */
  name: string;
  /** 头像地址 */
  avatar: string;
};

interface State {
  type: NETCALL_TYPE;
  /** 用户信息 */
  userinfo?: UserInfo;
  /** 静音 */
  mute: boolean;
  /** 免提 */
  handsfree: boolean;
  /** 是否等待接听中 */
  loading: boolean;
  /** 重连 */
  reconnect: boolean;
  /** 停止推流 */
  stoped: boolean;
}

const userinfo = {
  name: '医生：asddqwd',
  avatar: 'https://m.ijia120.com/miniprograms/avatar-default.png',
};

export default () => {
  const query = useQuery<{ type: NETCALL_TYPE; account: string; cid: string; becalling?: any }>();
  const becalling = React.useRef('becalling' in query);
  const vibrateTimer = React.useRef<NodeJS.Timeout>();
  const waitingAnsweredTimer = React.useRef<NodeJS.Timeout>();
  const player = React.useRef<Record<string, WechatMiniprogram.LivePlayerContext>>({});
  const pusher = React.useRef(createLivePusherContext());
  const [state, setState] = useSetState<State>({
    type: query.type || NETCALL_TYPE.AUDIO,
    userinfo,
    mute: false,
    handsfree: false,
    loading: true,
    reconnect: false,
    stoped: false,
  });

  const init = () => {
    if (!GlobalData.netcall) return;
    // 设置屏幕常亮
    setKeepScreenOn({ keepScreenOn: true });
    // 主动呼叫
    if (!becalling.current) {
      GlobalData.netcall
        .call({
          type:
            NETCALL_TYPE.AUDIO === query.type ? NETCALL_TYPE_VALUE.AUDIO : NETCALL_TYPE_VALUE.VIDEO,
          callee: query.account,
          forceKeepCalling: true,
          pushConfig: {
            custom: JSON.stringify({ [LEGAL_MESSAGE_KEY]: LEGAL_MESSAGE_VALUE }),
          },
        })
        .catch((error) => {
          console.log(error);
          showToast({ title: '呼叫失败,请重试', icon: 'none', onClose: destroy });
        });

      waitingAnsweredTimer.current = setTimeout(() => {
        showToast({ title: '无人接听', icon: 'none', onClose: destroy });
      }, 30 * 1000);
    }

    // 订阅事件
    register();
  };

  // 停止推流
  const stop = () => {};

  // 重连
  const reconnect = () => {};

  usePageEvent('onUnload', () => destroy());

  React.useEffect(init, []);

  // 被叫等待接听中设置震动
  React.useEffect(() => {
    if (state.loading && becalling.current) {
      vibrateTimer.current && clearInterval(vibrateTimer.current);
      vibrateTimer.current = setInterval(() => nextTick(vibrateLong), 1500);
    }
  }, [state.loading]);

  // 接听
  const onAnswer = React.useCallback(async () => {
    try {
      clear();
      await response(true);
      await GlobalData?.netcall?.startRtc({ mode: 0 }).then((data) => {
        setState({ loading: false, reconnect: true });
      });
    } catch (error) {
      showToast({ title: '接听失败,请重试', icon: 'none', onClose: destroy });
    }
  }, []);

  // 挂断
  const onHangup = React.useCallback(async () => {
    await response(false);

    destroy();
  }, []);

  // 切换到语音
  const onSwitchVoice = React.useCallback(async () => {
    await GlobalData?.netcall?.switchMode(GlobalData.netcall.NETCALL_MODE_ONLY_AUDIO);
    setState({ type: NETCALL_TYPE.AUDIO });
  }, []);

  // 切换前后摄像头
  const onSwitchCamera = React.useCallback(() => {
    pusher.current.switchCamera();
  }, []);

  // 切换静音状态
  const onMute = React.useCallback(async () => {
    await GlobalData.netcall?.switchMode(
      state.mute ? NETCALL_MODE.PURE_AUDIO : NETCALL_MODE.SILENCE,
    );
    setState({ mute: !state.mute });
  }, [state.mute]);

  // 切换免提状态
  const onHandsfree = React.useCallback(() => {
    setState({ handsfree: !state.handsfree });
  }, [state.handsfree]);

  // 应答
  const response = (accepted: boolean) => {
    return GlobalData?.netcall?.response({
      accepted,
      type: state.type === NETCALL_TYPE.AUDIO ? NETCALL_TYPE_VALUE.AUDIO : NETCALL_TYPE_VALUE.VIDEO,
      caller: query.account,
      cid: query.cid,
    });
  };

  const clear = React.useCallback(() => {
    waitingAnsweredTimer.current && clearTimeout(waitingAnsweredTimer.current);
    vibrateTimer.current && clearInterval(vibrateTimer.current);
  }, []);

  const destroy = React.useCallback(async () => {
    // 挂断
    !state.loading && (await GlobalData?.netcall?.hangup());
    // 清除定时器
    clear();
    // 停止推流
    stop();
    // 取消订阅事件
    unregister();
    // 返回上一页
    history.back();
  }, [state.loading]);

  const register = () => {};

  const unregister = () => {};

  return (
    <View className={s.wrapper}>
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
