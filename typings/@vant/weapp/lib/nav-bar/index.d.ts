import { ComponentType } from 'react';
import { GenericEvent } from 'remax/wechat';

declare const Navbar: ComponentType<{
  /** 根节点样式类 */
  customClass?: string;
  /** 标题样式类 */
  titleClass?: string;
  /** 标题 */
  title?: string;
  /** 左侧文案 */
  leftText?: string;
  /** 右侧文案 */
  rightText?: string;
  /** (default: false) 是否显示左侧箭头 */
  leftArrow?: boolean;
  /** (default: false) 是否固定在顶部 */
  fixed?: boolean;
  /** (default: false) 固定在顶部时是否开启占位*/
  placeholder?: boolean;
  /** (default: true) 是否显示下边框 */
  border?: boolean;
  /** (default: 1) 元素 z-index */
  zIndex?: number;
  /** 根节点自定义样式 */
  customStyle?: React.CSSProperties;
  /** (default: true) 是否留出顶部安全距离（状态栏高度） */
  safeAreaInsetTop?: boolean;
  /** 点击左侧按钮时触发 */
  'bind:click-left'?: (event: GenericEvent) => any;
  /** 点击右侧按钮时触发 */
  'bind:click-right'?: (event: GenericEvent) => any;
}>;

export default Navbar;
