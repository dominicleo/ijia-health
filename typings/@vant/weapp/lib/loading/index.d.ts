import { ComponentType } from 'react';

declare const Loading: ComponentType<{
  /** 根节点样式类 */
  customClass?: string;
  /** (default: #c9c9c9) 颜色 */
  color?: string;
  /** (default: circular) 类型 */
  type?: 'circular' | 'spinner';
  /** (default: 30px) 加载图标大小，默认单位为 px */
  size?: string | number;
  /** (default: 14px) 文字大小，默认单位为为 px */
  textSize?: string | number;
  /** (default: false) 是否垂直排列图标和文字内容 */
  vertical?: boolean;
}>;

export default Loading;
