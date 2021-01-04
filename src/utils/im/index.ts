import { hideLoading, showLoading } from 'remax/wechat';

import { NIM_APPKEY } from '@/constants/common';
import YunxinContainer from '@/containers/im';
import { UserService } from '@/services';

import { hasOwnProperty, JSONParse } from '@/utils';
import GlobalData from '../globalData';
import Netcall from './library/netcall';
import Nim, { NimMessage, NimRecord, NimSession, NimUser } from './library/nim';
import { NIM_MESSAGE_TYPE } from './library/nim.d';
import date from '../date';

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
      onmsg: (message) => YunxinContainer.setMessages([message]),
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
    loading && showLoading({ title: '', mask: true });

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

  static resetSessionUnread(session: Pick<NimSession, 'id' | 'lastMsg'>) {
    if (!GlobalData.nim) return Promise.reject(new YunxinError('resetSessionUnread: 未初始化完成'));
    if (!session) return Promise.reject(new YunxinError('resetSessionUnread: 会话数据为空'));
    GlobalData.nim.resetSessionUnread(session.id);
    return new Promise((resolve, reject) => {
      GlobalData.nim?.sendMsgReceipt({
        msg: session.lastMsg,
        done(error) {
          return error
            ? reject(new YunxinError(`resetSessionUnread: 发送消息已读回执失败\n${error}`))
            : resolve(undefined);
        },
      });
    });
  }

  static getSessionMessage(message: NimMessage) {
    if (!message) return '';
    switch (message.type) {
      case NIM_MESSAGE_TYPE.TEXT:
        return message.text;
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
        displayTime = date(timestamp).calendar(undefined, { sameElse: 'L LTS' });
      }
    } else {
      displayTime = date(timestamp).calendar(undefined, { sameElse: 'L LTS' });
    }
    return displayTime;
  }

  /** 校验消息是否合法 */
  static isLegalMessage(message: NimMessage) {
    const custom = JSONParse(message.custom);
    const content = JSONParse(message.content);
    const isCustomMessage = NIM_MESSAGE_TYPE.CUSTOM;

    // 对方自定义消息
    if (isCustomMessage && custom?.target === message.target) {
      return false;
    }
    // 自定义消息 (订单评价)
    if (isCustomMessage && content?.data?.code === '5') {
      return false;
    }
    // 自定义消息 (绑定病例)
    if (isCustomMessage && content?.data?.infoType === '0') {
      return false;
    }

    // 非我的医生消息
    if (!(hasOwnProperty(custom, 'IM_MESSAGE_TYPE') && custom.IM_MESSAGE_TYPE === 'MY_DOCTOR')) {
      return false;
    }
    return true;
  }
}

export default Yunxin;
