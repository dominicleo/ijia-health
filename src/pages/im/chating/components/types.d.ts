export enum CHATING_MEDIA_TYPE {
  /** 相册 */
  ALBUM = 'album',
  /** 拍摄 */
  CAMERA = 'camera',
  /** 视频 */
  VIDEO = 'video',
  /** 语音 */
  VOICE = 'voice',
}

export enum CHATING_MESSAGEBAR {
  /** 键盘输入 */
  KEYBOARD = 'keyboard',
  /** 语音输入 */
  VOICE = 'voice',
}

export enum CHATING_TOOLBAR {
  /** 隐藏 */
  HIDDEN = 0,
  /** 表情 */
  EMOJI = 1,
  /** 多媒体组件 */
  MEDIA = 2,
}

export enum MESSAGEBAR_ACTION_TYPE {
  /** 发送 */
  SEND = 'send',
  /** 清除输入框文本 */
  CLEAR = 'clear',
  /** 点击多媒体组件 */
  MEDIA = 'media',
  /** 显示支付窗口 */
  PAYMENT = 'payment',
}

export type EmojiItem = {
  name: string;
  url: string;
  catalog: string;
};

type MessagebarActionSendAction =
  | {
      type: 'text';
      payload: string;
    }
  | {
      type: 'audio';
      payload: WechatMiniprogram.OnStopCallbackResult;
    }
  | { type: 'emoji'; payload: EmojiItem };

export type MessagebarAction =
  | { type: MESSAGEBAR_ACTION_TYPE.SEND; payload: MessagebarActionSendAction }
  | {
      type: MESSAGEBAR_ACTION_TYPE.CLEAR;
    }
  | {
      type: MESSAGEBAR_ACTION_TYPE.MEDIA;
      payload: CHATING_MEDIA_TYPE;
    }
  | { type: MESSAGEBAR_ACTION_TYPE.PAYMENT };
