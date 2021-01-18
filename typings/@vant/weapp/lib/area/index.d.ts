import { ComponentType } from 'react';
import { GenericEvent } from 'remax/wechat';

type AreaList = Record<'province_list' | 'city_list' | 'county_list', Record<number, string>>;
type AreaData = Array<{ code: string; name: string }>;

declare const Area: ComponentType<{
  /** 当前选中的省市区 code */
  value?: string;
  /** 顶部栏标题	string */
  title?: string;
  /** 省市区数据，格式见下方	object */
  areaList: AreaList;
  /** (default: 3) 省市区显示列数，3-省市区，2-省市，1-省 */
  columnsNum?: string | number;
  /** 列占位提示文字 */
  columnsPlaceholder?: string[];
  /** (default: false) 是否显示加载状态 */
  loading?: boolean;
  /** (default: 44) 选项高度 */
  itemHeight?: number;
  /** (default: 6) 可见的选项个数 */
  visibleItemCount?: number;
  /** (default: 确认) 确认按钮文字 */
  confirmButtonText?: string;
  /** (default: 取消) 取消按钮文字 */
  cancelButtonText?: string;
  /** 点击右上方完成按钮 */
  bindconfirm?: (data: AreaData) => any;
  /** 点击取消按钮时 */
  bindcancel?: (event: GenericEvent) => any;
  /** 选项改变时触发 */
  bindchange?: (event: GenericEvent) => any;
}>;

export default Area;
