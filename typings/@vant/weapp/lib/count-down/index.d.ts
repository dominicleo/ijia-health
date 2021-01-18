import { ComponentType } from 'react';
import { GenericEvent } from 'remax/wechat';

type CountDownTimeData = Record<'days' | 'hours' | 'minutes' | 'seconds' | 'milliseconds', number>;

declare const CountDown: ComponentType<{
  /** 倒计时时长，单位毫秒 */
  time?: number;
  /** (default: HH:mm:ss) 时间格式，DD-日，HH-时，mm-分，ss-秒，SSS-毫秒 */
  format?: string;
  /** (default: true) 是否自动开始倒计时 */
  autoStart?: boolean;
  /** (default: false) 是否开启毫秒级渲染 */
  millisecond?: boolean;
  /** (default: false) 是否使用自定义样式插槽 */
  useSlot?: boolean;
  /** 倒计时结束时触发 */
  bindfinish?: (event: GenericEvent) => any;
  /** 时间变化时触发，仅在开启use-slot后才会触发 */
  bindchange?: (data: CountDownTimeData) => any;
}>;

export default CountDown;
