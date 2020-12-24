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

export enum CHATING_TOOLBAR_MODE {
  /** 隐藏 */
  HIDDEN = 0,
  /** 表情 */
  EMOJI = 1,
  /** 多媒体组件 */
  MEDIA = 2,
}

export enum MESSAGEBAR_MODE {
  /** 键盘输入 */
  KEYBOARD = 'keyboard',
  /** 语音输入 */
  VOICE = 'voice',
}

export enum MESSAGEBAR_ACTION_TYPE {
  /** 发送 */
  SEND = 'send',
  /** 获取输入框焦点 */
  FOCUS = 'focus',
  /** 失去输入框焦点 */
  BLUR = 'blur',
  /** 键盘高度发送变化 */
  KEYBOARDHEIGHTCHANGE = 'keyboardHeightChange',
  /** 点击多媒体组件 */
  MEDIA = 'media',
  /** 工具栏切换 */
  TOOLBAR = 'toolbar',
}

type MessagebarActionSendAction =
  | {
      type: 'text';
      payload: string;
    }
  | {
      type: 'audio';
      payload: WechatMiniprogram.OnStopCallbackResult;
    };

export type MessagebarAction =
  | { type: MESSAGEBAR_ACTION_TYPE.FOCUS | MESSAGEBAR_ACTION_TYPE.BLUR }
  | {
      type: MESSAGEBAR_ACTION_TYPE.KEYBOARDHEIGHTCHANGE;
      payload: number;
    }
  | { type: MESSAGEBAR_ACTION_TYPE.TOOLBAR; payload: CHATING_TOOLBAR_MODE }
  | {
      type: MESSAGEBAR_ACTION_TYPE.MEDIA;
      payload: CHATING_MEDIA_TYPE;
    }
  | { type: MESSAGEBAR_ACTION_TYPE.SEND; payload: MessagebarActionSendAction };
