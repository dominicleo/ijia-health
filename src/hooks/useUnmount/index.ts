import { useEffect } from 'react';

import usePersistFn from '../usePersistFn';
import { isFunction } from '../utils';

const useUnmount = (fn: any) => {
  const fnPersist = usePersistFn(fn);

  useEffect(
    () => () => {
      if (isFunction(fnPersist)) {
        // @ts-ignore
        fnPersist();
      }
    },
    [fnPersist],
  );
};

export default useUnmount;
