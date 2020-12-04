import { GenericEvent } from 'remax/wechat';

export const noop = (): void => {};

export const isRelease = __wxConfig?.envVersion === 'release';
export const isArray = Array.isArray;
export const isString = (value: any): value is string => typeof value === 'string';
export const isPlainObject = <T>(value: T): value is T =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
export const isFunction = (value: any): value is Function => typeof value === 'function';
export const isNumber = (value: any): value is number => /^\d+(\.\d+)?$/.test(value);
export const isBoolean = (value: any): value is boolean => typeof value === 'boolean';
export const isDefine = (value: any): boolean => value !== undefined && value !== null;
export const hasOwnProperty = (source: object, key: string) =>
  Object.prototype.hasOwnProperty.call(source, key);

/** 微信小程序取消操作 */
export const isNativeCancel = (
  event: GenericEvent & WechatMiniprogram.AccessFailCallbackResult,
): boolean => {
  return isPlainObject(event) && (event.errMsg || event.detail?.errMsg).includes('cancel');
};

/** 微信小程序拒绝操作 */
export const isNativeDeny = (
  event: GenericEvent & WechatMiniprogram.AccessFailCallbackResult,
): boolean => {
  return isPlainObject(event) && (event.errMsg || event.detail?.errMsg).includes('deny');
};

/** 获取 array 中的第一个元素 */
export function first<T>(value: T[]): T | undefined {
  if (!isArray(value)) return value;
  return value[0];
}

/** 获取 array 中的最后一个元素 */
export function last<T>(value: T[]): T | undefined {
  if (!isArray(value)) return value;
  return value[value.length - 1];
}

/** 获取当前页面实例 */
export const getCurrentPage = () => {
  const pages = getCurrentPages();
  const page = pages[pages.length - 1];
  return page;
};
