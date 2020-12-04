import { useState } from 'react';
import { getStorageSync, removeStorageSync, setStorageSync } from 'remax/wechat';

import useUpdateEffect from '../useUpdateEffect';
import { isFunction } from '../utils';

export interface IFuncUpdater<T> {
  (previousState?: T): T;
}

export type StorageStateDefaultValue<T> = T | IFuncUpdater<T>;

export type StorageStateResult<T> = [T | undefined, (value: StorageStateDefaultValue<T>) => void];

function useStorageState<T>(
  key: string,
  defaultValue?: StorageStateDefaultValue<T>,
): StorageStateResult<T> {
  const [state, setState] = useState<T | undefined>(() => getStoredValue());
  useUpdateEffect(() => {
    setState(getStoredValue());
  }, [key]);

  function getStoredValue() {
    const raw = getStorageSync(key);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {}
    }
    if (isFunction<IFuncUpdater<T>>(defaultValue)) {
      return defaultValue();
    }
    return defaultValue;
  }

  function updateState(value?: T | IFuncUpdater<T>) {
    if (typeof value === 'undefined') {
      removeStorageSync(key);
      setState(undefined);
    } else if (isFunction<IFuncUpdater<T>>(value)) {
      const previousState = getStoredValue();
      const currentState = value(previousState);
      setStorageSync(key, JSON.stringify(currentState));
      setState(currentState);
    } else {
      setStorageSync(key, JSON.stringify(value));
      setState(value);
    }
  }

  return [state, updateState];
}

export default useStorageState;
