type VantToastMessage = string | number;

type VantToastOptions = {
  /** (default: true) 显示 Toast */
  show?: boolean;
  /** (default: text) 提示类型 */
  type?: 'text' | 'loading' | 'success' | 'fail' | 'html';
  /** (default: false) 是否显示遮罩层 */
  mask?: boolean;
  /** (default: 1000) z-index 层级 */
  zIndex?: number;
  /** (default: 当前页面) 择器的选择范围，可以传入自定义组件的 this 作为上下文 */
  context?: object;
  /** (default: middle) 位置 */
  position?: 'middle' | 'top' | 'middle' | 'bottom';
  /** (default: 2000) 展示时长(ms)，值为 0 时，toast 不会消失 */
  duration?: number;
  /** (default: van-toast) 自定义选择器 */
  selector?: string;
  /** (default: false) 是否禁止背景点击 */
  forbidClick?: boolean;
  /** (default: circular) 加载图标类型 */
  loadingType?: 'circular' | 'spinner';
  /** 内容 */
  message?: VantToastMessage;
  /** 关闭时的回调函数 */
  onClose?: () => void;
};

type Config = VantToastMessage | VantToastOptions;

declare interface ToastInstance {
  /** 动态更新参数 */
  setData: (data: Config) => void;
}

export declare interface VantToastStatic {
  /** 提示 */
  (config: Config): ToastInstance;
  /** 加载提示 */
  loading: (config: Config) => ToastInstance;
  /** 成功提示 */
  success: (config: Config) => ToastInstance;
  /** 失败提示 */
  fail: (config: Config) => ToastInstance;
  /** 关闭所有提示 */
  clear: () => void;
  /** 修改默认配置，对所有 Toast 生效 */
  setDefaultOptions(config: Config): void;
  /** 重置默认配置，对所有 Toast 生效 */
  resetDefaultOptions(config: Config): void;
}

declare const VantToast: VantToastStatic;

export default VantToast;
