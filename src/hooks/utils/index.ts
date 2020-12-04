export function isFunction<T extends Function>(value: T): value is T {
  return typeof value === 'function';
}
