import { ComponentType } from 'react';
import { GenericEvent } from 'remax/wechat';

type Autosize = {
  maxHeight?: number;
  minHeight?: number;
};

declare const Field: ComponentType<{
  /** 左侧文本样式类 */
  labelClass?: string;
  /** 输入框样式类 */
  inputClass?: string;
  /** 右侧图标样式类 */
  rightIconClass?: string;
  /** 在表单内提交时的标识符 */
  name?: string;
  /** 输入框左侧文本 */
  label?: string;
  /** 单元格大小 */
  size?: 'large';
  /** 当前输入的值 */
  value?: string | number;
  /** (default: text) 可设置为任意原生类型, 如 */
  type?: 'text' | 'number' | 'idcard' | 'textarea' | 'digit';
  /** (default: false) 如果 type 为 textarea 且在一个 position:fixed 的区域，需要显示指定属性 fixed 为 true */
  fixed?: boolean;
  /** (default: false) 获取焦点 */
  focus?: boolean;
  /** (default: true) 是否显示内边框 */
  border?: boolean;
  /** (default: false) 是否禁用输入框 */
  disabled?: boolean;
  /** (default: false) 是否只读 */
  readonly?: boolean;
  /** (default: false) 是否启用清除控件 */
  clearable?: boolean;
  /** (default: false) 是否开启点击反馈 */
  clickable?: boolean;
  /** (default: false) 是否显示表单必填星号 */
  required?: boolean;
  /** (default: false) 是否是密码类型 */
  password?: boolean;
  /** (default: 6.2em) 标题宽度 */
  titleWidth?: string;
  /** (default: -1) 最大输入长度，设置为 -1 的时候不限制最大长度 */
  maxlength?: number;
  /** 输入框为空时占位符 */
  placeholder?: string;
  /** 指定 placeholder 的样式	*/
  placeholderStyle?: React.CSSProperties;
  /** 自定义样式 */
  customStyle?: React.CSSProperties;
  /** (default: false) 是否展示右侧箭头并开启点击反馈 */
  isLink?: number;
  /** 箭头方向 */
  arrowDirection?: 'left' | 'up' | 'down';
  /** (default: false) 是否显示字数统计，需要设置 maxlength 属性 */
  showWordLimit?: number;
  /** (default: false) 是否将输入内容标红 */
  error?: number;
  /** 底部错误提示文案，为空时不展示 */
  errorMessage?: string;
  /** 底部错误提示文案对齐方式 */
  errorMessageAlign?: 'center' | 'right';
  /** (default: left) 输入框内容对齐方式 */
  inputAlign?: 'left' | 'center' | 'right';
  /** (default: false) 是否自适应内容高度，只对 textarea 有效，可传入对象,如 { maxHeight: 100, minHeight: 50 }，单位为px */
  autosize?: boolean | Autosize;
  /** 左侧图标名称或图片链接，可选值见 Icon 组件 */
  leftIcon?: string;
  /** 右侧图标名称或图片链接，可选值见 Icon 组件 */
  rightIcon?: string;
  /** (default: done) 设置键盘右下角按钮的文字，仅在 type='text' 时生效 */
  confirmType?: string;
  /** (default: false) 点击键盘右下角按钮时是否保持键盘不收起，在 type='textarea' 时无效 */
  confirmHold?: boolean;
  /** (default: false) focus 时，点击页面的时候不收起键盘 */
  holdKeyboard?: boolean;
  /** (default: 50) 输入框聚焦时底部与键盘的距离 */
  cursorSpacing?: number;
  /** (default: true) 键盘弹起时，是否自动上推页面 */
  adjustPosition?: boolean;
  /** (default: true) 是否显示键盘上方带有”完成“按钮那一栏，只对 textarea 有效 */
  showConfirmBar?: boolean;
  /** (default: -1) 光标起始位置，自动聚集时有效，需与 selection-end 搭配使用 */
  selectionStart?: number;
  /** (default: -1) 光标结束位置，自动聚集时有效，需与 selection-start 搭配使用 */
  selectionEnd?: number;
  /** (default: false) 自动聚焦，拉起键盘 */
  autoFocus?: boolean;
  /** (default: true) 是否去掉 iOS 下的默认内边距，只对 textarea 有效 */
  disableDefaultPadding?: boolean;
  /** (default: -1) 指定 focus 时的光标位置 */
  cursor?: number;

  /** 输入内容时触发 */
  bindinput?: (event: GenericEvent<string>) => any;
  /** 输入内容时触发 */
  bindchange?: (event: GenericEvent<string>) => any;
  /** 点击完成按钮时触发 */
  bindconfirm?: (event: GenericEvent<string>) => any;
  /** 点击尾部图标时触发 */
  'bind:click-icon'?: (event: GenericEvent) => any;
  /** 输入框聚焦时触发 */
  bindfocus?: (
    event: GenericEvent<{
      /** 当前输入值 */
      value: string;
      /** 键盘高度 */
      height: number;
    }>,
  ) => any;
  /** 输入框失焦时触发 */
  bindblur?: (
    event: GenericEvent<{
      /** 当前输入值 */
      value: string;
      /** 游标位置 (如果 type 不为 textarea，值为 0) */
      cursor: number;
    }>,
  ) => any;
  /** 点击清空控件时触发 */
  bindclear?: (event: GenericEvent) => any;
  /** 输入框行数变化时调用，只对 textarea 有效 */
  bindlinechange?: (
    event: GenericEvent<{
      height: number;
      heightRpx: number;
      lineCount: number;
    }>,
  ) => any;
  /** 键盘高度发生变化的时候触发此事件 */
  bindkeyboardheightchange?: (
    event: GenericEvent<{
      /** 键盘高度 */
      height: number;
      /** 键盘切换动效执行时间 */
      duration: number;
    }>,
  ) => any;
}>;

export default Field;
