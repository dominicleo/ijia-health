import { ComponentType } from 'react';
import { GenericEvent } from 'remax/wechat';

declare const Cell: ComponentType<{
  /** 根节点样式类 */
  customClass?: string;
  /** 标题样式类 */
  titleClass?: string;
  /** 描述信息样式类 */
  labelClass?: string;
  /** 右侧内容样式类 */
  valueClass?: string;
  /** 左侧图标名称或图片链接，可选值见 Icon 组件*/
  icon?: string;
  /** 左侧标题	string | number	-	*/
  title?: number | string;
  /** 标题宽度，须包含单位 */
  titleWidth?: string;
  /** 右侧内容 */
  value?: string;
  /** 标题下方的描述信息*/
  label?: string;
  /** 单元格大小 */
  size?: 'large';
  /** (default: true) 是否显示下边框 */
  border?: boolean;
  /** (default: false) 是否使内容垂直居中 */
  center?: boolean;
  /** 点击后跳转的链接地址 */
  url?: string;
  /** (default: navigateTo) 链接跳转类型 */
  linkType?: 'navigateTo' | 'redirectTo' | 'switchTab' | 'reLaunch';
  /** (default: false) 是否开启点击反馈 */
  clickable?: boolean;
  /** (default: false) 是否展示右侧箭头并开启点击反馈 */
  isLink?: boolean;
  /** (default: false) 是否显示表单必填星号 */
  required?: boolean;
  /** 箭头方向*/
  arrowDirection?: 'left' | 'up' | 'down';
  /** (default: false) 是否使用 label slot */
  useLabelSlot: boolean;
  /** 标题样式 */
  titleStyle?: React.CSSProperties;
  /** 点击单元格时触发 */
  bindclick?: (event: GenericEvent) => any;
}>;

export default Cell;
