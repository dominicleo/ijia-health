export enum CALL_MODE {
  /** 主叫 */
  CALLING = 'calling',
  /** 被叫 */
  BECALLING = 'becalling',
}

export enum CONTROL_TYPE {
  /** 语音接听 */
  ANSWER = 'answer',
  /** 视频接听 */
  VIDEOUP = 'videoup',
  /** 挂断 */
  HANGUP = 'hangup',
  /** 取消 */
  CANCEL = 'cancel',
  /** 静音 */
  MUTE = 'mute',
  /** 免提 */
  HANDSFREE = 'handsfree',
  /** 切换摄像头 */
  CUTCAMERA = 'cutcamera',
  /** 切换至语音 (接通后) */
  CUTVIDEO = 'cutvoice',
  /** 切换至语音 (接通前) */
  ICON_CUTVIDEO = 'icon-cutvoice',
}
