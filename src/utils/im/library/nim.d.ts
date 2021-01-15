export interface NimError extends Error {
  code: number;
  event: { callFunc: string };
}

type Done<T, R = void> = (error: NimError, data: T) => R;

type SendMessageBaseOptions = {
  /** 场景 */
  scene?: NIM_SCENE;
  /** 接收方, 对方帐号或者群id */
  to?: string;
  /** 扩展字段 */
  custom?: string;
  /** 如果是重发, 那么需要带上之前生成的idClient来标记这条消息 */
  idClient?: string;
  /** 是否是重发 */
  resend?: boolean;
  /** 结果回调函数 */
  done?: Done<NimMessage>;
  /** 发送状态 */
  status?: NIM_MESSAGE_STATUS;
};

interface SendTextMessageOptions extends SendMessageBaseOptions {
  type: NIM_MESSAGE_TYPE.TEXT;
  /** 文本消息内容 */
  text: string;
}

interface SendFileMessageOptions extends SendMessageBaseOptions {
  type: NIM_MESSAGE_TYPE.IMAGE | NIM_MESSAGE_TYPE.AUDIO | NIM_MESSAGE_TYPE.VIDEO;
  /** 文件临时路径 (微信小程序特有) */
  wxFilePath: string;
}
interface SendCustomMessageOptions extends SendMessageBaseOptions {
  type: NIM_MESSAGE_TYPE.CUSTOM;
  /** 自定义消息的消息内容, 推荐使用JSON格式构建 */
  content: string;
}

export type SendMessageOptions =
  | SendTextMessageOptions
  | SendFileMessageOptions
  | SendCustomMessageOptions;

export interface NimInstance extends Record<string, any> {
  name: string;
  account: string;
  /** 发送文本消息 */
  sendText: (options: SendTextMessageOptions) => void;
  /** 发送文件消息 */
  sendFile: (options: SendFileMessageOptions) => void;
  /** 发送自定义消息 */
  sendCustomMsg: (options: SendCustomMessageOptions) => void;
  /** 获取用户名片数组 */
  getUsers: (options: { accounts: string[]; sync?: boolean; done?: Done<NimUser[]> }) => void;
  /** 重置某个会话的未读数 */
  resetSessionUnread: (sessionId: string) => void;
  /** 发送消息已读回执 */
  sendMsgReceipt: (options?: { msg: NimMessage; done?: Done<any> }) => void;
  /** 建立连接 */
  connect: () => void;
  /** 断开连接 */
  disconnect: () => void;
  /** 销毁实例 */
  destroy: () => void;
}

export enum NIM_MESSAGE_TYPE {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  FILE = 'file',
  GEO = 'geo',
  CUSTOM = 'custom',
  TIP = 'tip',
  ROBOT = 'robot',
  NOTIFICATION = 'notification',
  WITHDRAW = 'deleteMsg',
  WHITEBOARD = '白板消息',
  SNAPCHAT = '阅后即焚',
}

export enum NIM_MESSAGE_STATUS {
  /** 发送中 */
  SENDING = 'sending',
  /** 发送成功 */
  SUCCESS = 'success',
  /** 发送失败 */
  FAIL = 'fail',
}

export enum NIM_MESSAGE_FLOW {
  /** 表示此消息是收到的消息 */
  IN = 'in',
  /** 表示此消息是发出的消息 */
  OUT = 'out',
}

type MessageType = NIM_MESSAGE_TYPE;

export enum NIM_SCENE {
  /** 单人聊天 */
  P2P = 'p2p',
  /** 群聊 */
  TEAM = 'team',
  /** 超大群聊天 */
  SUPERTEAM = 'superTeam',
}

export type NimFileBase = {
  /** 文件地址 */
  url: string;
  /** 名字 */
  name: string;
  /** 大小, 单位byte */
  size: number;
  /** md5 */
  md5: string;
  /** 扩展名 */
  ext: string;
};

export interface NimImageFile extends NimFileBase {
  /** 宽, 单位px */
  w: number;
  /** 高, 单位px */
  h: number;
}

export interface NimAudioFile extends NimFileBase {
  /** 长度, 单位ms */
  dur: number;
  /** 实时转成 mp3 流的 url, 此 url 支持的格式有: mp3, wav, aac, wma, wmv, amr, mp2, flac, vorbis, ac3 */
  mp3Url: string;
}
export interface NimVideoFile extends NimFileBase {
  /** 长度, 单位ms */
  dur: number;
  /** 宽, 分辨率, 单位px */
  w: number;
  /** 高, 分辨率, 单位px */
  h: number;
}

export type NimFile = NimImageFile | NimAudioFile | NimVideoFile | NimFileBase;

export type NimMessage<F = NimFile> = {
  /** 消息类型 */
  type: MessageType;
  /** 消息发送方帐号 */
  from: string;
  /** 消息的流向 */
  flow: NIM_MESSAGE_FLOW;
  /** 消息所属的会话的 ID */
  sessionId: string;
  /** 消息接收方, 帐号或群 ID */
  to: string;
  /** 场景 */
  scene: NIM_SCENE;
  /** 扩展字段 */
  custom: any;
  /** 自定义消息的消息内容 */
  content?: any;
  /** 附加信息 */
  attach?: Record<any, string>;
  /** 文本消息的文本内容 */
  text?: string;
  /** 文件消息的文件对象 */
  file?: F;
  /** SDK生成的消息id, 在发送消息之后会返回给开发者, 开发者可以在发送消息的结果回调里面根据这个ID来判断相应消息的发送状态, 到底是发送成功了还是发送失败了, 然后根据此状态来更新页面的UI。如果发送失败, 那么可以重新发送此消息 */
  idClient: string;
  /** 服务器用于区分消息用的ID, 用于获取历史消息和获取包含关键词的历史消息, 此字段可能没有, 所以开发者应该使用idClient来唯一标识消息 */
  idServer?: string;
  /** 聊天对象, 账号或者群id */
  target: string;
  /** 发送时间 */
  time: number;
  /** 自定义推送文案 */
  pushContent?: string;
  /** 消息发送状态 */
  status: NIM_MESSAGE_STATUS;
};

export interface NimRecord<F = NimFile> extends NimMessage<F> {
  user: NimUser;
  custom: Record<string, any>;
  content: Record<string, any>;
  displayTime: string;
  originalMessage: NimMessage;
}

export type NimSession = {
  id: string;
  lastMsg: NimMessage;
  scene: NIM_SCENE;
  to: string;
  unread: number;
  updateTime: number;
};

export type NimUser = {
  account: string;
  avatar: string;
  nick: string;
  tel: string;
};

export type NimReceiveMessage = {
  msgs: NimMessage[];
  scene: NIM_SCENE;
  sessionId: string;
  timetag: number;
  to: string;
};

export type NimDisconnectCallbackResponse =
  | { code: 302 }
  | { code: 417 }
  | {
      code: 'kicked';
      reason: 'samePlatformKick' | 'serverKick' | 'otherPlatformKick';
      message: string;
      custom: any;
      from: 'Android' | 'iOS' | 'PC' | 'Web' | 'Server' | 'Mac' | 'WindowsPhone';
      customClientType: string;
    };

interface CallbackEvents {
  /** 连接成功 */
  onconnect?(): void;
  /** 断开连接 */
  ondisconnect?(data: NimDisconnectCallbackResponse): void;
  /** 连接已端开,正在重连 */
  onwillreconnect?(): void;
  /** 同步登录用户名片的回调 */
  onmyinfo?(data: NimUser): void;
  /** 当前登录用户在其它端修改自己的个人名片之后的回调 */
  onupdatemyinfo?(data: NimUser): void;
  /** 同步会话列表 */
  onsessions?(data: NimSession[]): void;
  /** 更新会话 */
  onupdatesession?(data: NimSession): void;
  /** 同步漫游消息 */
  onroamingmsgs?(data: NimReceiveMessage): void;
  /** 同步离线消息 */
  onofflinemsgs?(data: NimReceiveMessage): void;
  /** 收到消息 */
  onmsg?(data: NimMessage): void;
  /** 同步完成回调 */
  onsyncdone?(): void;
  /** 错误回调 */
  onerror?(error: NimError): void;
}

interface NimOptions extends CallbackEvents {
  appKey: string;
  account: string;
  token: string;
  debug?: boolean;
  /** (default: false) 是否同步会话的未读数 */
  syncSessionUnread?: boolean;
}

declare class Nim {
  static getInstance(options: NimOptions): NimInstance;
  static use(instance: any): void;
}

export default Nim;
