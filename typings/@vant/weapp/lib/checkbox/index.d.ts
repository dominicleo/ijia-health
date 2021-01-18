import { ComponentType } from 'react';
import { GenericEvent } from 'remax/wechat';

declare const Checkbox: ComponentType<{
  /** 根节点样式类 */
  customClass?: string;
  /** 图标样式类 */
  iconClass?: string;
  /** 描述信息样式类 */
  labelClass?: string;
  /** 标识 Checkbox 名称 */
  name?: string;
  /** (default: round) 形状 */
  shape?: 'square' | 'round';
  /** (default: false) 是否为选中状态 */
  value?: boolean;
  /** (default: false) 是否禁用单选框 */
  disabled?: boolean;
  /** (default: false) 是否禁用单选框内容点击 */
  labelDisabled?: boolean;
  /** (default: right) 文本位置 */
  labelPosition?: 'left' | 'right';
  /** (default: false) 是否使用 icon slot */
  useIconSlot?: boolean;
  /** (default: #1989fa) 选中状态颜色 */
  checkedColor?: string;
  /** (default: 20px) icon 大小 */
  iconSize?: string | number;
  /** 当绑定值变化时触发的事件 */
  bindchange?: (event: GenericEvent) => any;
}>;

export default Checkbox;
