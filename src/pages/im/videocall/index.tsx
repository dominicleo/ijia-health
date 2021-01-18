import * as React from 'react';
import { usePageInstance } from 'remax';
import {
  createLivePlayerContext,
  createLivePusherContext,
  setKeepScreenOn,
  View,
} from 'remax/wechat';
import { Subscribe } from 'unstated';

import YunxinContainer from '@/containers/im';
import { isEqual } from '@/utils';
import GlobalData from '@/utils/globalData';
import history from '@/utils/history';

import Control from './components/Control';
import Player from './components/Player';
import Pusher from './components/Pusher';
import Toast from './components/toast';
import UserInfo from './components/UserInfo';
import s from './index.module.less';
import { getLivePlayElementId } from './utils';
import { NETCALL_EVENT_NAME } from '@/utils/im';

const CALL_TYPE_VOICE = 1;
const CALL_TYPE_VIDEO = 2;

const CALLING_WAITING_TEXT = '正在等待对方接受邀请';
const BECALLING_VIDEO_TEXT = '邀请你视频通话';
const BECALLING_VOICDE_TEXT = '邀请你语音通话';

class VideoCall extends React.Component<any, any> {
  livePusherContext: WechatMiniprogram.LivePusherContext | null = null;
  livePlayerMap: { [key: string]: WechatMiniprogram.LivePlayerContext } = {};
  callingTimer: any;
  stopStreamTimer: any;
  reconnectStreamTimer: any;
  constructor(props: any) {
    super(props);
    const { type, callee, caller, cid, ...query } = this.props.location.query;
    const callType = type - 0;
    const isBecalling = query.becalling === 'true';
    this.state = {
      callee,
      caller,
      // 正在通话
      thecall: false,
      // 主叫中
      calling: isBecalling === false,
      // 被叫中
      becalling: isBecalling === true,
      // 是否被叫
      isBecalling,
      // 通话类型
      callType,
      // 当前用户资料
      user: {},
      // 通话用户列表
      users: [],
      // 当前用户信息
      userinfo: { cid },
      // 被叫用户信息
      becallUserinfo: isBecalling
        ? {
            cid,
            caller,
            type: callType,
          }
        : {},
      // 音视频流重连标记
      streamNeedReconnect: false,
      // 音视频流暂停标记
      streamStoped: false,
      // 静音
      muted: false,
      // 免提
      handsfree: false,
    };
  }

  onUnload() {
    if (this.state.thecall || this.state.calling) {
      this.hangup();
    }
    this.unregisterEvents();
  }

  static getDerivedStateFromProps(props: any, state: any) {
    const { users } = props;
    const { isBecalling, caller, callee } = state;
    const user = users[isBecalling ? caller : callee];
    if (isEqual(state.user, user)) {
      return null;
    }
    return {
      user,
    };
  }

  componentDidMount() {
    if (GlobalData?.netcall) {
      GlobalData.isPushBeCallPage = false;
      setKeepScreenOn({
        keepScreenOn: true,
      });
      if (!this.state.isBecalling) {
        GlobalData?.netcall
          .call({
            type: this.state.callType,
            callee: this.state.callee,
            forceKeepCalling: true,
            pushConfig: {
              custom: JSON.stringify({ IM_MESSAGE_TYPE: 'MY_DOCTOR' }),
            },
          })
          .catch((error: any) => {
            console.log('呼叫失败', error);
            Toast.info('呼叫失败,请重试', 3000, this.hangup);
          });

        this.clearCallingTimer();
        this.callingTimer = setTimeout(() => {
          Toast.info('无人接听', 3000, this.hangup);
        }, 30 * 1000);
      }
      this.initialWindowStyle();
      this.registerEvents();
    }
  }

  // 初始化窗口样式
  initialWindowStyle = () => {
    const selfWindowStyle = {
      top: '80PX',
      right: '30PX',
      width: '100PX',
      height: '150PX',
    };
    const otherWindowStyle = {
      top: 0,
      left: 0,
      bottom: 0,
      right: 0,
    };
    this.setState({ selfWindowStyle, otherWindowStyle });
  };

  // 清除呼叫计时器
  clearCallingTimer = () => {
    this.callingTimer && clearTimeout(this.callingTimer);
    this.callingTimer = null;
  };

  // 重置状态
  reset = () => {
    this.clearCallingTimer();
    this.stopStreamTimer && clearTimeout(this.stopStreamTimer);
    this.setState({
      calling: false,
      becalling: false,
      thecall: false,
      users: [],
      streamStoped: false,
      streamNeedReconnect: false,
    });
  };

  // 停止推流
  stopStream = (duration = 1000) => {
    this.stopStreamTimer && clearTimeout(this.stopStreamTimer);
    if (this.state.streamStoped) return Promise.resolve();

    return new Promise((resolve) => {
      this.stopStreamTimer = setTimeout(() => {
        if (!this.livePusherContext) {
          return;
        }
        if (!this.livePlayerMap) {
          this.livePlayerMap = {};
        }
        this.state.users.forEach((user: any) => {
          const uid = String(user?.uid);
          if (user?.uid != this.state.userinfo.uid) {
            if (!this.livePlayerMap[uid]) {
              this.livePlayerMap[uid] = createLivePlayerContext(
                getLivePlayElementId(user?.uid),
                this.props.instance,
              );
            }
            this.livePlayerMap[uid].stop();
          }
        });
        this.livePusherContext.stop({
          complete: () => {
            this.setState({
              streamStoped: true,
            });
            resolve(null);
          },
        });
      }, duration);
    });
  };

  // 重连
  reconnectStream = () => {
    if (this.livePusherContext && this.state.streamNeedReconnect) {
      this.stopStreamTimer && clearTimeout(this.stopStreamTimer);
      this.livePusherContext.start({
        success: () => {
          this.setState({
            streamStoped: false,
          });
        },
        complete: () => {
          this.state.users.forEach((user: any) => {
            const uid = String(user?.uid);
            if (user?.uid != this.state.userinfo.uid) {
              if (!this.livePlayerMap[uid]) {
                this.livePlayerMap[uid] = createLivePlayerContext(
                  getLivePlayElementId(user?.uid),
                  this.props.instance,
                );
              }
              this.livePlayerMap[uid].play();
            }
          });
        },
      });
    }
  };

  // 重连（延迟执行）
  reconnectStreamAfter = (duration = 0) => {
    this.reconnectStreamTimer && clearTimeout(this.reconnectStreamTimer);
    this.reconnectStreamTimer = setTimeout(() => {
      this.reconnectStream();
    }, duration);
  };

  // 返回
  goback = () => {
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    if (currentPage.route.includes('videocall')) {
      history.back();
    }
  };

  // 挂断
  hangup = (goback = true) => {
    return Promise.resolve()
      .then(() => {
        if (GlobalData?.netcall) {
          GlobalData?.netcall.hangup();
        }
        return Promise.resolve();
      })
      .then(() => {
        // 停止推拉流
        this.reset();
        this.stopStream(0);
        goback && this.goback();
        this.clearCallingTimer();
        this.unregisterEvents();
        // 避免频繁操作
        // clearTimeout(GlobalData?.videoCallTimer);
        // GlobalData?.videoCallTimer = setTimeout(() => {
        //   GlobalData?.waitingUseVideoCall = false;
        // }, 2000);
        // GlobalData?.waitingUseVideoCall = true;
      });
  };

  // 注册事件
  registerEvents = () => {
    GlobalData?.event.on(NETCALL_EVENT_NAME.SYNC_DONE, (data: any) => {
      const UserInfo = Object.assign([], data.userlist);
      if (UserInfo.length === 1) {
        UserInfo.push({});
        UserInfo.reverse();
      }
      if (this.state.users.length === 2) {
        console.error('syncDone streamNeedReconnect', UserInfo);
        this.setState({
          users: [],
          streamNeedReconnect: true,
        });
        setTimeout(() => {
          this.setState({
            thecall: true,
            users: UserInfo,
          });
        }, 70);
        Toast.info('重新建立连接，请稍后');
        this.reconnectStreamAfter(100);
        return;
      }

      this.setState({
        thecall: true,
        users: UserInfo,
        streamNeedReconnect: true,
      });
      this.reconnectStreamAfter();
      this.clearCallingTimer();
    });

    GlobalData?.event.on(NETCALL_EVENT_NAME.CALL_ACCEPTED, (data: any) => {
      GlobalData?.netcall?.startRtc({ mode: 0 }).then((data: any) => {
        this.livePusherContext = createLivePusherContext();
        this.setState({
          userinfo: data,
          calling: false,
          streamNeedReconnect: true,
        });
      });
    });

    GlobalData?.event.on(NETCALL_EVENT_NAME.CALL_REJECTED, (data: any) => {
      console.log('对方拒绝了', data);
      this.setState({ thecall: false });
      Toast.info('对方拒绝了您的请求', 3000);
      this.hangup();
    });

    GlobalData?.event.on(NETCALL_EVENT_NAME.CLIENT_JOIN, (data: any) => {
      this.personJoin(data);
    });

    GlobalData?.event.on(NETCALL_EVENT_NAME.BE_CALLING, (data: any) => {
      if (this.state.thecall || this.state.isCalling || this.state.becallUserinfo.cid != data.cid) {
        // 如果通话中，则拒绝
        GlobalData?.netcall?.response({
          accepted: false,
          caller: data.caller,
          type: data.type,
          cid: data.cid,
        });
        return;
      }

      this.setState({
        becallUserinfo: data,
      });
    });

    GlobalData?.event.on(NETCALL_EVENT_NAME.HANGUP, (data: any) => {
      // 接通过程
      if (data.cid != this.state.userinfo.cid && this.state.thecall) {
        console.warn('接通过程,非本通通话，抛弃');
        return;
      }
      // 被叫过程
      if (this.state.becalling && this.state.becallUserinfo.cid != data.cid) {
        console.warn('被叫过程,非本通通话，抛弃');
        return;
      }
      // 主叫过程
      if (this.state.calling && data.account != this.state.caller) {
        console.warn('主叫过程,非本通通话，抛弃');
        return;
      }
      this.clearCallingTimer();
      Toast.info('对方已经挂断', 3000);
      this.hangup();
    });
    GlobalData?.event.on(NETCALL_EVENT_NAME.CONTROL, (data: any) => {
      this.controlCommand(data);
    });
    // 准备重连
    GlobalData?.event.on(NETCALL_EVENT_NAME.WILL_RECONNECT, () => {
      this.stopStream();
    });
  };

  // 解除事件
  unregisterEvents = () => {
    GlobalData?.event.removeAllListeners();
  };

  // 控制指令
  controlCommand = (data: any) => {
    switch (data.command) {
      // 从视频切换到音频
      case GlobalData?.netcall?.NETCALL_CONTROL_COMMAND_SWITCH_VIDEO_TO_AUDIO:
        this.switchToVoice();
        break;
    }
  };

  // 加入通话
  personJoin = (data: any) => {
    const UserInfo = Object.assign([], this.state.users);
    const uids = UserInfo.map((user: any) => user?.uid) || [];
    if (uids.includes(data.uid) === false) {
      if (this.state.userinfo.uid !== data.uid) {
        Object.assign(UserInfo[0], data);
      }
      this.setState({
        users: UserInfo,
      });
    }
  };

  // 切换至音频
  switchToVoice = () => {
    this.setState({
      enableCamera: false,
      callType: CALL_TYPE_VOICE,
    });
    GlobalData?.netcall
      ?.switchMode(GlobalData?.netcall.NETCALL_MODE_ONLY_AUDIO)
      .then(() => {
        this.stopStream(0).then(() => this.reconnectStreamAfter(100));
      })
      .catch((error: any) => {
        console.error('switchMode', error);
      });
  };

  // 切换摄像头
  switchCamera = () => {
    this.livePusherContext && this.livePusherContext.switchCamera();
  };

  // 静音切换
  // 0音视频，1纯音频，2纯视频，3静默
  switchVoiceInput = () => {
    // 纯音频
    const VOICE = 1;
    // 静音
    const MUTED = 3;
    const { muted } = this.state;
    GlobalData?.netcall?.switchMode(muted ? VOICE : MUTED).catch((error: any) => {
      console.error('静音切换', error);
    });
    this.setState({ muted: !muted });
  };

  // 接听
  onAccept = () => {
    const { type, cid, caller } = this.state.becallUserinfo;
    GlobalData?.netcall
      ?.response({
        accepted: true,
        caller,
        type,
        cid,
      })
      .then(() => {
        GlobalData?.netcall?.startRtc({ mode: 0 }).then((data: any) => {
          this.clearCallingTimer();
          this.setState({
            calling: false,
            becalling: false,
            userinfo: data,
            streamNeedReconnect: true,
          });
          this.livePusherContext = createLivePusherContext();
        });
      })
      .catch((error: any) => {
        console.log('接听失败', error);
        Toast.info('接听失败,请重试', 3000, this.hangup);
      });
  };

  // 拒绝接听
  onReject = () => {
    this.clearCallingTimer();
    const { type, cid, caller } = this.state.becallUserinfo;
    GlobalData?.netcall
      ?.response({
        accepted: false,
        caller,
        type,
        cid,
      })
      .then(() => {
        this.reset();
        this.hangup();
      })
      .catch((error: any) => {
        console.error('拒绝接听失败', error);
      });
  };

  // 免提切换
  onSwitchHandsfree = () => {
    this.setState({ handsfree: !this.state.handsfree });
  };

  render() {
    const {
      thecall,
      becalling,
      isBecalling,
      callType,
      user = {},
      users,
      muted,
      handsfree,
      userinfo,
      selfWindowStyle,
      otherWindowStyle,
    } = this.state;

    const isVoice = callType === CALL_TYPE_VOICE;
    const BECALLING_WAITTING_TEXT = isVoice ? BECALLING_VOICDE_TEXT : BECALLING_VIDEO_TEXT;

    const voiceSoundMode = handsfree ? 'speaker' : 'ear';
    const playerSoundMode = isVoice ? voiceSoundMode : 'speaker';

    return (
      <View className={s.wrapper}>
        {(!thecall || isVoice) && (
          <UserInfo
            name={user?.nick}
            avatar={user?.avatar}
            center={isVoice}
            overlay={isVoice ? 'avatar' : 'camera'}
            description={becalling ? BECALLING_WAITTING_TEXT : CALLING_WAITING_TEXT}
            showDescription={!thecall}
          />
        )}

        {users.map((data: any, index: number) => (
          <View key={index}>
            {data.uid === userinfo.uid && (
              <Pusher
                key={data.uid}
                url={data.url}
                style={selfWindowStyle}
                muted={muted}
                enableCamera={!isVoice}
              />
            )}
            {data.uid !== userinfo.uid && (
              <Player
                id={getLivePlayElementId(data.uid)}
                url={data.url}
                style={otherWindowStyle}
                soundMode={playerSoundMode}
              />
            )}
          </View>
        ))}

        <Control
          thecall={thecall}
          mode={isBecalling ? 'becalling' : 'calling'}
          type={isVoice ? 'voice' : 'video'}
          onAccept={this.onAccept}
          onReject={this.onReject}
          onCancel={this.hangup}
          onSwitchVoice={this.switchToVoice}
          onSwitchCamera={this.switchCamera}
          onSwitchMute={this.switchVoiceInput}
          onSwitchHandsfree={this.onSwitchHandsfree}
          muted={muted}
          handsfree={handsfree}
        />
      </View>
    );
  }
}

const Wrapper = (props: any) => {
  const instance = usePageInstance();
  return (
    <Subscribe to={[YunxinContainer]}>
      {({ state }) => <VideoCall {...props} users={state.users} instance={instance} />}
    </Subscribe>
  );
};

export default Wrapper;
