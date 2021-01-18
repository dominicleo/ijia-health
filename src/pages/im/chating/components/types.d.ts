import { NimAudioFile, NimRecord } from '@/utils/im';

export enum CHATING_MEDIA_TYPE {
  /** 相册 */
  ALBUM = 'album',
  /** 拍摄 */
  CAMERA = 'camera',
  /** 视频 */
  VIDEO = 'video',
  /** 语音 */
  AUDIO = 'audio',
}

export enum CHATING_MESSAGEBAR {
  /** 键盘输入 */
  KEYBOARD = 'keyboard',
  /** 语音输入 */
  AUDIO = 'audio',
}

export enum CHATING_TOOLBAR {
  /** 隐藏 */
  HIDDEN = 0,
  /** 表情 */
  EMOJI = 1,
  /** 多媒体组件 */
  MEDIA = 2,
}

export enum CHATING_ACTION_TYPE {
  /** 发送 */
  SEND = 'send',
  /** 清除输入框文本 */
  CLEAR = 'clear',
  /** 点击多媒体组件 */
  MEDIA = 'media',
  /** 显示支付窗口 */
  PAYMENT = 'payment',
  /** 播放音频 */
  PLAYAUDIO = 'playaudio',
  /** 预览图片/视频 */
  PREVIEW = 'preview',
  /** 刷新订单 */
  REFRESH_ORDER = 'refreshorder',
}

export type EmojiItem = {
  name: string;
  url: string;
  catalog: string;
};

export enum MESSAGEBAR_ACTION_TYPE {
  /** 文本 */
  TEXT = 'text',
  /** 音频 */
  AUDIO = 'audio',
  /** 表情 */
  EMOJI = 'emoji',
}

type MessagebarSendActionText = {
  type: MESSAGEBAR_ACTION_TYPE.TEXT;
  payload: string;
};
type MessagebarSendActionAudio = {
  type: MESSAGEBAR_ACTION_TYPE.AUDIO;
  payload: WechatMiniprogram.OnStopCallbackResult;
};
type MessagebarSendActionEmoji = {
  type: MESSAGEBAR_ACTION_TYPE.EMOJI;
  payload: EmojiItem;
};

type MessagebarSendAction =
  | MessagebarSendActionText
  | MessagebarSendActionAudio
  | MessagebarSendActionEmoji;

type ChatingActionSend = { type: CHATING_ACTION_TYPE.SEND; payload: MessagebarSendAction };
type ChatingActionClear = {
  type: CHATING_ACTION_TYPE.CLEAR;
};
type ChatingActionMedia = {
  type: CHATING_ACTION_TYPE.MEDIA;
  payload: CHATING_MEDIA_TYPE;
};
type ChatingActionPlayAudio = { type: CHATING_ACTION_TYPE.PLAYAUDIO; payload: NimAudioFile };
type ChatingActionPreview = { type: CHATING_ACTION_TYPE.PREVIEW; payload: NimRecord };
type ChatingActionPayment = { type: CHATING_ACTION_TYPE.PAYMENT };
type ChatingActionRefreshOrder = { type: CHATING_ACTION_TYPE.REFRESH_ORDER };

export type ChatingAction =
  | ChatingActionSend
  | ChatingActionClear
  | ChatingActionMedia
  | ChatingActionPlayAudio
  | ChatingActionPreview
  | ChatingActionPayment
  | ChatingActionRefreshOrder;
