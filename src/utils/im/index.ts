import { hideLoading, showLoading } from 'remax/wechat';

import { NIM_APPKEY } from '@/constants/common';
import YunxinContainer from '@/containers/im';
import { UserService } from '@/services';
import { hasOwnProperty, isString, JSONParse } from '@/utils';

import date from '../date';
import GlobalData from '../globalData';
import Netcall from './library/netcall';
import Nim, { NimMessage, NimRecord, NimSession, NimUser, SendMessageOptions } from './library/nim';
import { NIM_MESSAGE_FLOW, NIM_MESSAGE_STATUS, NIM_MESSAGE_TYPE } from './library/nim.d';
import { MESSAGE_RECORD_CUSTOM_TYPE } from '@/pages/im/chating/components/record/components/types.d';

export * from './library/nim.d';
export * from './library/netcall.d';

export class YunxinError extends Error {
  name = 'YunxinError';
  constructor(message: string) {
    super(message);
    this.message = message || this.name;
  }
}

interface YunxinOptions {
  account: string;
  token: string;
  onSuccess?: (value?: any) => void;
  onError?: () => void;
}

const DEBUG = false;

// 消息间隔时间
const MESSAGE_INTERVAL_TIME = 60 * 1000 * 2;

/** 我的医生消息自定义键 */
export const LEGAL_MESSAGE_KEY = 'IM_MESSAGE_TYPE';
/** 我的医生消息自定义值 */
export const LEGAL_MESSAGE_VALUE = 'MY_DOCTOR';

class Yunxin {
  constructor(options: YunxinOptions) {
    GlobalData.nim = Nim.getInstance({
      debug: DEBUG,
      appKey: NIM_APPKEY,
      account: options.account,
      token: options.token,
      syncSessionUnread: true,
      onconnect: () => {
        this.onConnect();
        options.onSuccess && options.onSuccess();
      },
      onerror: () => {
        this.onError();
        options.onError && options.onError();
      },
      onmyinfo: (user) => YunxinContainer.setUsers([user]),
      onupdatemyinfo: (user) => YunxinContainer.setUsers([user]),
      onsessions: this.onSessions,
      onupdatesession: (session) => YunxinContainer.setSessions([session]),
      onroamingmsgs: ({ msgs }) => YunxinContainer.setMessages(msgs),
      onofflinemsgs: ({ msgs }) => YunxinContainer.setMessages(msgs),
      onmsg: (message) => YunxinContainer.updateMessage(message),
      onsyncdone: () => YunxinContainer.synced(),
    });
  }

  onConnect() {
    if (!GlobalData.nim) return;
    GlobalData.netcall = Netcall.getInstance({ debug: DEBUG, nim: GlobalData.nim });
    // console.log(GlobalData.nim);
    // console.log(GlobalData.netcall);
  }
  onError() {
    GlobalData.nim?.disconnect();
    GlobalData.nim?.connect();
  }

  onSessions(sessions: NimSession[]) {
    GlobalData.nim?.getUsers({
      accounts: sessions.map(({ to }) => to),
      sync: true,
      done(error, users) {
        if (error) return;
        YunxinContainer.setUsers(users);
      },
    });
    YunxinContainer.setSessions(sessions);
  }

  static async init(loading = true) {
    if (GlobalData.nim) return Promise.resolve();
    loading && showLoading({ title: '正在获取数据', mask: true });

    const { account, token } = await UserService.getYunxinConfig().catch((error) => {
      hideLoading();
      throw error;
    });

    return new Promise((resolve, reject) => {
      new Yunxin({ account, token, onSuccess: resolve, onError: reject });
    }).finally(() => hideLoading());
  }

  static destroy() {
    try {
      GlobalData.nim?.destroy();
      GlobalData.netcall?.destroy();
      GlobalData.nim = undefined;
      GlobalData.netcall = undefined;
      YunxinContainer.reset();
    } catch (error) {}
  }

  static getSessionMessage(message: NimMessage) {
    if (!message) return '';
    switch (message.type) {
      case NIM_MESSAGE_TYPE.TEXT:
        return message.text || '';
      case NIM_MESSAGE_TYPE.IMAGE:
        return '[图片]';
      case NIM_MESSAGE_TYPE.AUDIO:
        return '[语音]';
      case NIM_MESSAGE_TYPE.VIDEO:
        return '[视频]';
      case NIM_MESSAGE_TYPE.FILE:
        return '[文件]';
      case NIM_MESSAGE_TYPE.GEO:
        return '[位置]';
      case NIM_MESSAGE_TYPE.CUSTOM:
        return message.pushContent || '[系统消息]';
      case NIM_MESSAGE_TYPE.TIP:
        return '[提醒消息]';
      case NIM_MESSAGE_TYPE.ROBOT:
        return '[客服消息]';
      case NIM_MESSAGE_TYPE.NOTIFICATION:
        return '[通知消息]';
      case NIM_MESSAGE_TYPE.WITHDRAW:
        return '撤回了一条消息';
      case NIM_MESSAGE_TYPE.WHITEBOARD:
        return '[白板]';
      case NIM_MESSAGE_TYPE.SNAPCHAT:
        return '[阅后即焚]';
      default:
        return '';
    }
  }

  static formatMessageRecordList(
    messages: Record<number, NimMessage>,
    users: Record<string, NimUser>,
  ) {
    const records: NimRecord[] = [];

    Object.values(messages).forEach((message) => {
      records.push({
        ...message,
        custom: JSONParse(message.custom),
        content: JSONParse(message.content),
        user: users[message.from],
        displayTime: Yunxin.getMessageRecordDisplayTime(records, message.time),
        originalMessage: message,
      });
    });

    return records;
  }

  static getMessageRecordDisplayTime(records: NimRecord[], timestamp: number) {
    const lastMessageRecord = records[records.length - 1];
    let displayTime = '';
    if (lastMessageRecord) {
      const delta: number = timestamp - lastMessageRecord.time;
      if (delta > MESSAGE_INTERVAL_TIME) {
        displayTime = date(timestamp).calendar(undefined);
      }
    } else {
      displayTime = date(timestamp).calendar(undefined);
    }
    return displayTime;
  }

  /** 校验消息是否合法 */
  static isLegalMessage(message: NimMessage) {
    const custom = JSONParse(message.custom);
    const content = JSONParse(message.content);
    const isCustomMessage = NIM_MESSAGE_TYPE.CUSTOM;

    // 用户支付结果通知
    if (
      isCustomMessage &&
      content.type === MESSAGE_RECORD_CUSTOM_TYPE.PAYRESULT &&
      custom.target === message.target
    ) {
      return false;
    }

    // 系统通知
    if (isCustomMessage && content.type === MESSAGE_RECORD_CUSTOM_TYPE.SYSTEM) {
      return false;
    }

    // 自定义消息 (绑定病例)
    if (isCustomMessage && content.type === MESSAGE_RECORD_CUSTOM_TYPE.SETMEAL) {
      return false;
    }

    // 自定义消息 (订单评价)
    if (isCustomMessage && content?.data?.code === '5') {
      return false;
    }

    // 非我的医生消息
    if (
      !(
        hasOwnProperty(custom, LEGAL_MESSAGE_KEY) &&
        custom[LEGAL_MESSAGE_KEY] === LEGAL_MESSAGE_VALUE
      )
    ) {
      return false;
    }
    return true;
  }

  /** 发送消息 */

  static sendMessage(options: SendMessageOptions): Promise<NimMessage> {
    return new Promise((resolve, reject) => {
      const { done } = options;
      options.done = (error, message) => {
        done && done(error, message);
        error && reject(error);
        resolve(message);
      };

      switch (options.type) {
        case NIM_MESSAGE_TYPE.TEXT:
          GlobalData.nim?.sendText(options);
          break;
        case NIM_MESSAGE_TYPE.CUSTOM:
          GlobalData.nim?.sendCustomMsg(options);
          break;
        case NIM_MESSAGE_TYPE.IMAGE:
        case NIM_MESSAGE_TYPE.AUDIO:
        case NIM_MESSAGE_TYPE.VIDEO:
          GlobalData.nim?.sendFile(options);
          break;
        default:
          reject(new YunxinError('sendMessage 未知发送类型'));
      }
    });
  }

  /** 获取发送消息数据 */
  static getSendMessage<T extends SendMessageOptions>(options: T): NimMessage {
    const custom = {
      [LEGAL_MESSAGE_KEY]: LEGAL_MESSAGE_VALUE,
    };

    const time = Date.now();
    const config: any = {
      idClient: time,
      content: '',
      target: options.to,
      flow: NIM_MESSAGE_FLOW.OUT,
      status: NIM_MESSAGE_STATUS.SENDING,
      time,
      from: GlobalData.nim?.account,
      ...options,
    };

    config.custom = JSON.stringify(custom);

    return config;
  }
}

export default Yunxin;
