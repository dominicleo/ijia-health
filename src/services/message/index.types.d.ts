export enum MESSAGE_TYPE {
  /** 服务消息 */
  SERVICE = 'SERVICE',
  /** 系统消息 */
  SYSTEM = 'SYSTEM',
}

export enum MESSAGE_LINK_TYPE {
  IM = 'P2P_IM_WINDOW',
}

export interface Message {
  /** 消息 ID */
  id: number;
  /** 消息类型 */
  type: MESSAGE_TYPE;
  /** 消息标题 */
  title: string;
  /** 消息内容 */
  content: string;
  /** 时间 */
  date: string;
  /** 扩展字段 */
  params: { [key: string]: any };
}
