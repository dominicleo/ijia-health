import Yunxin, { NimMessage, NimSession, NimUser } from '@/utils/im';
import Container from '@/utils/unstated/container';

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
}

const INITIAL_STATE: YunxinContainerState = {
  users: {},
  unread: {},
  sessions: {},
  messages: {},
  synced: false,
};

class container extends Container<YunxinContainerState> {
  state = INITIAL_STATE;

  setSessionId(sessionId: string) {
    return this.setState({ sessionId });
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
      this.state.messages[message.sessionId] = message;
    });
    this.setState({ messages: this.state.messages });
  }

  updateMessage(message: NimMessage) {
    if (!message) return;
    if (!Yunxin.isLegalMessage(message)) return;

    // 正在当前会话则发送已读回执、清空未读数
    if (this.state.sessionId === message.sessionId) {
      Yunxin.resetSessionUnread({ id: message.sessionId, lastMsg: message });
    }

    this.setMessages([message]);
  }

  synced() {
    return this.setState({ synced: true });
  }

  reset() {
    return this.setState(INITIAL_STATE);
  }
}

const YunxinContainer = new container();

export default YunxinContainer;
