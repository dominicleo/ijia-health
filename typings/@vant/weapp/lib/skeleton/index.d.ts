import { ComponentType } from 'react';

declare const Skeleton: ComponentType<{
  /** (default: 0) 段落占位图行数 */
  row?: number;
  /** (default: 100%) 段落占位图宽度，可传数组来设置每一行的宽度 */
  rowWidth?: string | string[];
  /** (default: false) 是否显示标题占位图 */
  title?: boolean;
  /**  (default: 40%) 标题占位图宽度 */
  titleWidth?: number | string;
  /** (default: false) 是否显示头像占位图 */
  avatar?: boolean;
  /** (default: 32) 头像占位图大小*/
  avatarSize?: number | string;
  /** (default: round) 头像占位图形状 */
  avatarShape?: 'square' | 'round';
  /** (default: true) 是否显示占位图，传false时会展示子组件内容 */
  loading?: boolean;
  /** (default: true) 是否开启动画 */
  animate?: boolean;
}>;

export default Skeleton;
