import { ComponentType } from 'react';
import { GenericEvent } from 'remax/wechat';

type Detail = {
  /** 标签索引 */
  index: number;
  /** 标签标识符 */
  name: string;
  /** 标题 */
  title: string;
};

declare const Tabs: ComponentType<{
  /** 根节点样式类 */
  customClass?: string;
  /** 标签栏样式类 */
  navClass?: string;
  /** 标签样式类 */
  tabClass?: string;
  /** 标签激活态样式类 */
  tabActiveClass?: string;
  /** (default: 0) 当前选中标签的标识符 */
  active?: string | number;
  /** (default: #ee0a24) 标签颜色 */
  color?: string;
  /** (default: 1) z-index 层级 */
  zIndex?: number;
  /** (default: line) 样式风格 */
  type?: 'line' | 'card';
  /** (default: false) 是否展示外边框，仅在 line 风格下生效 */
  border?: boolean;
  /** (default: 0.3) 动画时间 (单位秒) */
  duration?: number;
  /** (default: 40px) 底部条宽度 (px) */
  lineWidth?: string | number;
  /** (default: 3px) 底部条高度 (px) */
  lineHeight?: string | number;
  /** (default: 5) 滚动阈值，设置标签数量超过多少个可滚动 */
  swipeThreshold?: number;
  /** (default: false) 是否使用动画切换 Tabs */
  animated?: boolean;
  /** (default: true) 是否省略过长的标题文字 */
  ellipsis?: boolean;
  /** (default: false) 是否使用粘性定位布局 */
  sticky?: boolean;
  /** (default: false) 是否开启手势滑动切换 */
  swipeable?: boolean;
  /** (default: true) 是否开启标签页内容延迟渲染 */
  lazyRender?: boolean;
  /** 粘性定位布局下与顶部的最小距离，单位px */
  offsetTop?: number;

  /** 点击标签时触发 */
  bindclick?: (event?: GenericEvent<Detail>) => any;
  /** 当前激活的标签改变时触发 */
  bindchange?: (event?: GenericEvent<Detail>) => any;
  /** 点击被禁用的标签时触发 */
  binddisabled?: (event?: GenericEvent<Detail>) => any;
  /** 滚动时触发 */
  bindscroll?: (
    event?: GenericEvent<{
      /** 距离顶部位置 */
      scrollTop?: number;
      /** 是否吸顶 */
      isFixed: boolean;
    }>,
  ) => any;
}>;

export default Tabs;
