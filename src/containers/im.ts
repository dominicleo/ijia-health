import GlobalData from '@/utils/globalData';
import Yunxin, { NimMessage, NimSession, NimUser } from '@/utils/im';
import { Container } from 'unstated';

interface YunxinContainerState {
  /** 当前会话 ID */
  sessionId?: string;
  /** 用户列表 */
  users: Record<string, NimUser>;
  /** 未读会话 */
  unread: Record<string, number>;
  /** 会话列表 */
  sessions: Record<string, NimSession>;
  /** 消息列表 */
  messages: Record<string, Record<number, NimMessage>>;
  /** 同步完成状态 */
  synced: boolean;
  /** 重置会话已读队列 */
  resetSessionUnreadQueue: string[];
}

const INITIAL_STATE: YunxinContainerState = {
  users: {},
  unread: {},
  sessions: {},
  messages: {},
  synced: false,
  resetSessionUnreadQueue: [],
};

class container extends Container<YunxinContainerState> {
  state = INITIAL_STATE;

  setSessionId(sessionId: string) {
    return new Promise((resolve) => {
      this.resetSessionUnread(sessionId).finally(async () => {
        await this.setState({ sessionId });
        return resolve(undefined);
      });
    });
  }

  setUsers(users: NimUser[]) {
    if (!users) return;
    users.forEach((user) => {
      this.state.users[user.account] = user;
    });

    return this.setState({ users: this.state.users });
  }

  setSessions(sessions: NimSession[]) {
    if (!sessions) return;
    sessions.forEach((session) => {
      this.state.sessions[session.id] = session;
    });

    return this.setState({ sessions: this.state.sessions });
  }

  setMessages(messages: NimMessage[]) {
    if (!messages) return;
    messages.forEach((message) => {
      if (!Yunxin.isLegalMessage(message)) return;
      if (!this.state.messages[message.sessionId]) {
        this.state.messages[message.sessionId] = {};
      }
      this.state.messages[message.sessionId][message.time] = message;
    });
    this.setState({ messages: this.state.messages });
  }

  updateMessage(message: NimMessage) {
    if (!message) return;
    if (!Yunxin.isLegalMessage(message)) return;

    // 正在当前会话则发送已读回执、清空未读数
    if (this.state.sessionId === message.sessionId) {
      this.resetSessionUnread(message.sessionId);
    }

    this.setMessages([message]);
  }

  /** 标记已读并发送消息已读回执 */
  async resetSessionUnread(sessionId: string) {
    if (!GlobalData.nim) return Promise.reject(new Error('未初始化完成'));
    if (!sessionId) return Promise.reject(new Error('会话id为空'));

    // 未同步完成，加入队列处理
    if (this.state.synced) {
      this.setState({
        resetSessionUnreadQueue: this.state.resetSessionUnreadQueue.concat(sessionId),
      });
      return;
    }

    GlobalData.nim.resetSessionUnread(sessionId);

    const lastMessage = this.state.sessions[sessionId]?.lastMsg;

    if (lastMessage) {
      return new Promise((resolve, reject) => {
        GlobalData.nim?.sendMsgReceipt({
          msg: lastMessage,
          done(error) {
            return error ? reject(new Error(`发送消息已读回执失败\n${error}`)) : resolve(undefined);
          },
        });
      });
    }
  }

  execResetSessionUnread() {
    const { resetSessionUnreadQueue: queue } = this.state;
    queue.length &&
      queue.filter(Boolean).forEach((sessionId) => this.resetSessionUnread(sessionId));
  }

  synced() {
    return this.setState({ synced: true }, () => this.execResetSessionUnread());
  }

  reset() {
    return this.setState(INITIAL_STATE);
  }
}

const YunxinContainer = new container();

export default YunxinContainer;
