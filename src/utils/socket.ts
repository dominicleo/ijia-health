import { STORAGE } from '@/constants';
import { SOCKET_URL } from '@/utils/baseURL';
import { connectSocket, getStorageSync } from 'remax/wechat';
import { isFunction, JSONParse } from '.';

export default class createSocket {
  socket?: WechatMiniprogram.SocketTask;
  retryTimer: any;
  heartbeatTimer: any;
  onMessage?: any;
  constructor(callback?: any) {
    this.onMessage = callback;
    this.connect();
  }

  connect() {
    const token = getStorageSync(STORAGE.ACCESS_TOKEN);
    this.socket = connectSocket({
      url: SOCKET_URL,
      header: { token },
      fail: () => this.retry(),
    });
    this.start();
  }

  clear() {
    this.retryTimer && clearTimeout(this.retryTimer);
    this.heartbeatTimer && clearTimeout(this.heartbeatTimer);
  }

  retry() {
    this.retryTimer && clearTimeout(this.retryTimer);
    this.retryTimer = setTimeout(() => this.connect(), 3000);
  }

  heartbeat() {
    this.heartbeatTimer && clearTimeout(this.heartbeatTimer);
    this.heartbeatTimer = setTimeout(() => {
      if (!this.socket) return;
      this.socket.send({ data: 'heartbeat' });
      this.heartbeat();
    }, 10000);
  }

  start() {
    if (!this.socket) return;
    this.socket.onOpen((event: any) => {
      // console.log('onOpen', e);
      this.heartbeat();
    });
    this.socket.onMessage((response: any) => {
      const data = JSONParse(response.data);
      isFunction(this.onMessage) && this.onMessage(data);
    });
    this.socket.onError((error: any) => {
      console.log('socket connect failed', error);
      this.retry();
    });
    this.socket.onClose((event: any) => {
      console.log('onClose', event);
      this.clear();
    });
  }

  destroy() {
    this.clear();
    this.socket && this.socket.close({ code: 1000, reason: 'destroy' });
  }
}
