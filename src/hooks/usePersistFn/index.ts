import { useEffect, useRef } from 'react';

export type noop = (this: any, ...args: any[]) => any;

function usePersistFn<T extends noop>(fn: T) {
  const fnRef = useRef<T>(fn);
  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const persistFn = useRef<T>();
  if (!persistFn.current) {
    persistFn.current = function (...args) {
      return fnRef.current!.apply(this, args);
    } as T;
  }

  return persistFn.current!;
}

export default usePersistFn;
