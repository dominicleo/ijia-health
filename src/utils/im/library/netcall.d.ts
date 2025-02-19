import { NimInstance } from './nim.d';

export enum NETCALL_TYPE {
  /** 音频 */
  AUDIO = 'audio',
  /** 视频 */
  VIDEO = 'video',
}

export enum NETCALL_TYPE_VALUE {
  /** 音频 */
  AUDIO = 1,
  /** 视频 */
  VIDEO = 2,
}

export enum NETCALL_MODE {
  /** 音视频 */
  AUDIO_VIDEO = 0,
  /** 纯视频 */
  PURE_AUDIO = 1,
  /** 纯视频 */
  PURE_VIDEO = 2,
  /** 静默 (无音频无视频) */
  SILENCE = 3,
}

export enum NETCALL_EVENT_NAME {
  /** 同步成功 */
  SYNC_DONE = 'onNetcallSyncDone',
  /** 有人加入了 */
  CLIENT_JOIN = 'onNetcallClientJoin',
  /** 有人离开了 */
  CLIENT_LEAVE = 'onNetcallClientLeave',
  /** 对方接听了 */
  CALL_ACCEPTED = 'onNetcallCallAccepted',
  /** 对方拒绝了 */
  CALL_REJECTED = 'onNetcallCallRejected',
  /** 被呼叫 */
  BE_CALLING = 'onNetcallBeCalling',
  /** 本通通话在其他端已经处理了 */
  CALLER_ACK_SYNC = 'onNetcallCallerAckSync',
  /** 对端挂断了 */
  HANGUP = 'onNetcallHangup',
  /** 收到控制指令 */
  CONTROL = 'onNetcallControl',
  /** 连接已端开,正在重连 */
  WILL_RECONNECT = 'onNetcallWillReconnect',
}

type NetcallControlCommand = {
  /** 通知对方自己打开了音频 */
  NETCALL_CONTROL_COMMAND_NOTIFY_AUDIO_ON: 1;
  /**  通知对方自己关闭了音频 */
  NETCALL_CONTROL_COMMAND_NOTIFY_AUDIO_OFF: 2;
  /** 通知对方自己打开了视频 */
  NETCALL_CONTROL_COMMAND_NOTIFY_VIDEO_ON: 3;
  /** 通知对方自己关闭了视频 */
  NETCALL_CONTROL_COMMAND_NOTIFY_VIDEO_OFF: 4;
  /** 请求从音频切换到视频 */
  NETCALL_CONTROL_COMMAND_SWITCH_AUDIO_TO_VIDEO: 5;
  /** 同意从音频切换到视频 */
  NETCALL_CONTROL_COMMAND_SWITCH_AUDIO_TO_VIDEO_AGREE: 6;
  /** 拒绝从音频切换到视频 */
  NETCALL_CONTROL_COMMAND_SWITCH_AUDIO_TO_VIDEO_REJECT: 7;
  /** 从视频切换到音频 */
  NETCALL_CONTROL_COMMAND_SWITCH_VIDEO_TO_AUDIO: 8;
  /** 占线 */
  NETCALL_CONTROL_COMMAND_BUSY: 9;
  /** 自己的摄像头不可用 */
  NETCALL_CONTROL_COMMAND_SELF_CAMERA_INVALID: 10;
  /** 自己处于后台 */
  NETCALL_CONTROL_COMMAND_SELF_ON_BACKGROUND: 11;
  /** 告诉发送方自己已经收到请求了（用于通知发送方开始播放提示音） */
  NETCALL_CONTROL_COMMAND_START_NOTIFY_RECEIVED: 12;
};

type Callback = (data: any) => void;

type CallOptions = {
  type: NETCALL_TYPE_VALUE;
  callee: string;
  forceKeepCalling: boolean;
  pushConfig?: { custom: string };
};

export interface NetcallInstance extends NetcallControlCommand, Record<string, any> {
  startRtc: (options: { mode: NETCALL_MODE }) => Promise<any>;
  switchMode: (mode: NETCALL_MODE) => Promise<any>;
  response: (options: {
    type: NETCALL_TYPE_VALUE;
    caller: string;
    accepted: boolean;
    cid: string;
  }) => Promise<any>;
  call: (options: CallOptions) => Promise<any>;
  control: (options: { command: Number }) => Promise<any>;
  hangup: () => Promise<any>;
  on: (event: string, callback: Callback) => void;
  /** 销毁实例 */
  destroy: () => void;
}

interface NetcallOptions {
  debug?: boolean;
  nim: NimInstance;
}

declare class Netcall {
  static getInstance(options: NetcallOptions): NetcallInstance;
  static destroy(): void;
}

export default Netcall;
