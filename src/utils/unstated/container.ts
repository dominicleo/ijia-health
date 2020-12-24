import { Listener } from './types.d';

const CONTAINER_DEBUG_CALLBACKS: any[] = [];

export interface ContainerConstructor<State> {
  new (...args: any[]): Container<State>;
}

export default abstract class Container<State> {
  abstract state: State;

  private _listeners: Listener[] = [];

  constructor() {
    CONTAINER_DEBUG_CALLBACKS.forEach((cb) => cb(this));
  }

  async setState(
    updater: (prevState: Partial<State>) => Partial<State>,
    callback?: () => void,
  ): Promise<void>;
  async setState(updater: Partial<State>, callback?: () => void): Promise<void>;
  async setState(updater: any, callback?: () => void): Promise<void> {
    await Promise.resolve();
    let nextState;

    if (typeof updater === 'function') {
      nextState = updater(this.state);
    } else {
      nextState = updater;
    }

    if (nextState === null) {
      if (callback) callback();
      return;
    }

    // 合并 state
    this.state = Object.assign({}, this.state, nextState);

    // 触发 state 监听
    const promises = this._listeners.map((listener) => listener());

    await Promise.all(promises);

    if (callback) {
      return callback();
    }
  }

  subscribe(fn: Listener) {
    this._listeners.push(fn);
  }

  unsubscribe(fn: Listener) {
    this._listeners = this._listeners.filter((listener) => listener !== fn);
  }
}
