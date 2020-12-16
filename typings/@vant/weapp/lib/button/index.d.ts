import { ComponentType } from 'react';
import { GenericEvent } from 'remax/wechat';

declare const Button: ComponentType<{
  /** 根节点样式类 */
  customClass?: string;
  /** 加载图标样式类 */
  loadingClass?: string;
  /** 标识符 */
  id?: string;
  /** (default: default) 按钮类型 */
  type?: 'default' | 'primary' | 'info' | 'warning' | 'danger';
  /** (default: normal) 按钮尺寸 */
  size?: 'normal' | 'large' | 'small' | 'mini' | 'normal';
  /** 按钮颜色，支持传入linear-gradient渐变色 */
  color?: string;
  /** 左侧图标名称或图片链接，可选值见 Icon 组件 */
  icon?: string;
  /** (default: van-icon) 图标类名前缀，同 Icon 组件的 classPrefix 属性 */
  classPrefix?: string;
  /** (default: false) 是否为朴素按钮 */
  plain?: boolean;
  /** (default: false) 是否为块级元素 */
  block?: boolean;
  /** (default: false) 是否为圆形按钮 */
  round?: boolean;
  /** (default: false) 是否为方形按钮 */
  square?: boolean;
  /** (default: false) 是否禁用按钮 */
  disabled?: boolean;
  /** (default: false) 是否使用 0.5px 边框 */
  hairline?: boolean;
  /** (default: false) 是否显示为加载状态 */
  loading?: boolean;
  /** 加载状态提示文字 */
  loadingText?: string;
  /** (default: circular)加载状态图标类型 */
  loadingType?: 'circular' | 'spinner';
  /** (default: 20px) 加载图标大小 */
  loadingSize?: string;
  /** 自定义样式 */
  customStyle?: React.CSSProperties;
  /** 微信开放能力 */
  openType?:
    | 'contact'
    | 'share'
    | 'getPhoneNumber'
    | 'getUserInfo'
    | 'launchApp'
    | 'openSetting'
    | 'feedback';
  /** 打开 APP 时，向 APP 传递的参数 */
  appParameter?: string;
  /** (default: en) 指定返回用户信息的语言 */
  lang?: 'en' | 'zh_CN' | 'zh_TW';
  /** 会话来源 */
  sessionFrom?: string;
  /** 客服消息子商户 id */
  businessId?: number;
  /** (default: 当前标题) 会话内消息卡片标题 */
  sendMessageTitle?: string;
  /** (default: 当前分享路径) 会话内消息卡片点击跳转小程序路径 */
  sendMessagePath?: string;
  /** (default: 截图) sendMessageImg */
  sendMessageImg?: string;
  /** (default: false)显示会话内消息卡片 */
  showMessageCard?: false | string;
  /** 按钮 dataset，open-type 为 share 时，可在 onShareAppMessage 事件的 event.target.dataset.detail 中看到传入的值 */
  dataset?: any;
  /** 用于 form 组件，可选值为submit reset，点击分别会触发 form 组件的 submit/reset 事件 */
  formType?: 'submit' | 'reset';
  /** 点击按钮，且按钮状态不为加载或禁用时触发 */
  bindclick?: (event: GenericEvent) => any;
  /** 用户点击该按钮时，会返回获取到的用户信息, 从返回参数的 detail 中获取到的值同 wx.getUserInfo */
  bindgetuserinfo?: (event: GenericEvent) => any;
  /** 客服消息回调 */
  bindcontact?: (event: GenericEvent) => any;
  /** 获取用户手机号回调 */
  bindgetphonenumber?: (event: GenericEvent) => any;
  /** 当使用开放能力时，发生错误的回调 */
  binderror?: (event: GenericEvent) => any;
  /** 在打开授权设置页后回调 */
  bindopensetting?: (event: GenericEvent) => any;
  /** 打开 APP 成功的回调 */
  bindlaunchapp?: (event: GenericEvent) => any;
}>;

export default Button;
