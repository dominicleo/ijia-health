import { ComponentType } from 'react';
import { GenericEvent } from 'remax/wechat';

declare const Popup: ComponentType<{
  /** 根节点样式类 */
  customClass?: string;
  /** (default: false) 是否显示弹出层 */
  show?: boolean;
  /** (default: 100) z-index 层级 */
  zIndex?: number;
  /** (default: true) 是否显示遮罩层 */
  overlay?: boolean;
  /** (default: center) 弹出位置 */
  position?: 'top' | 'bottom' | 'right' | 'left' | 'center';
  /** (default: 300) 动画时长，单位为毫秒 */
  duration?: number | object;
  /** (default: false) 是否显示圆角 */
  round?: boolean;
  /** 自定义弹出层样式 */
  customStyle?: React.CSSProperties;
  /** 自定义遮罩层样式 */
  overlayStyle?: React.CSSProperties;
  /** (default: true) 是否在点击遮罩层后关闭 */
  closeOnClickOverlay?: boolean;
  /** (default: false) 是否显示关闭图标 */
  closeable?: boolean;
  /** (default: cross) 关闭图标名称或图片链接 */
  closeIcon?: string;
  /** (default: true) 是否为 iPhoneX 留出底部安全距离 */
  safeAreaInsetBottom?: boolean;
  /** (default: false) 是否留出顶部安全距离（状态栏高度） */
  safeAreaInsetTop?: boolean;
  /** 关闭弹出层时触发 */
  bindclose?: (event: GenericEvent) => any;
  /** 点击遮罩层时触发 */
  'bind:click-overlay'?: (event: GenericEvent) => any;
  /** 进入前触发 */
  'bind:before-enter'?: (event: GenericEvent) => any;
  /** 进入中触发 */
  bindenter?: (event: GenericEvent) => any;
  /** 进入后触发 */
  'bindafter-enter'?: (event: GenericEvent) => any;
  /** 离开前触发 */
  'bind:before-leave'?: (event: GenericEvent) => any;
  /** 离开中触发 */
  bindleave?: (event: GenericEvent) => any;
  /** 离开后触发 */
  'bind:after-leave'?: (event: GenericEvent) => any;
}>;

export default Popup;
