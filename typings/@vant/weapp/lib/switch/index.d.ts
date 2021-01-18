import { ComponentType } from 'react';
import { GenericEvent } from 'remax/wechat';

declare const Switch: ComponentType<{
  /** 根节点样式类 */
  customClass?: string;
  /** 圆点样式类 */
  nodeClass?: string;
  /** 在表单内提交时的标识符 */
  name?: string;
  /** (default: false) 开关选中状态 */
  checked?: boolean;
  /** (default: false) 是否为加载状态 */
  loading?: boolean;
  /** (default: false) 是否为禁用状态 */
  disabled?: boolean;
  /** (default: 30px) 开关尺寸 */
  size?: string;
  /** (default: #1989fa) 打开时的背景色 */
  activeColor?: string;
  /** (default: #fff) 关闭时的背景色 */
  inactiveColor?: string;
  /** (default: true) 打开时的值 */
  activeValue?: boolean;
  /** (default: false) 关闭时的值 */
  inactiveValue?: boolean;
  /** 开关状态切换回调 */
  bindchange?: (event: GenericEvent<boolean>) => void;
}>;

export default Switch;
