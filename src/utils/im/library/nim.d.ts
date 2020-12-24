type Done<T, R = void> = (error: Error, data: T) => R;

export interface NimInstance extends Record<string, any> {
  name: string;
  account: string;
  sendText: () => void;
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

export type NimMessage = {
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
  content: any;
  /** 文本消息的文本内容 */
  text: string;
  /** 发送时间 */
  time: number;
  /** 自定义推送文案 */
  pushContent: string;
  /** 消息发送状态 */
  status: NIM_MESSAGE_STATUS;
};

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

interface CallbackEvents {
  /** 连接成功 */
  onconnect?(): void;
  /** 断开连接 */
  ondisconnect?(): void;
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
  onmsg?(data: NimReceiveMessage): void;
  /** 同步完成回调 */
  onsyncdone?(): void;
  /** 错误回调 */
  onerror?(error: Error): void;
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
}

export default Nim;
