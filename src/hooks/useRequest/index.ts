import { useContext } from 'react';

import ConfigContext from './configContext';
import { BaseOptions, BaseResult, CombineService, OptionsWithFormat } from './types';
import useAsync from './useAsync';

function useRequest<R = any, P extends any[] = any, U = any, UU extends U = any>(
  service: CombineService<R, P>,
  options: OptionsWithFormat<R, P, U, UU>,
): BaseResult<U, P>;

function useRequest<R = any, P extends any[] = any>(
  service: CombineService<R, P>,
  options?: BaseOptions<R, P>,
): BaseResult<R, P>;

function useRequest(service: any, options: any = {}) {
  const contextConfig = useContext(ConfigContext);
  const finalOptions = { ...contextConfig, ...options };

  return useAsync(service, finalOptions);
}

const UseRequestProvider = ConfigContext.Provider;

export { UseRequestProvider };

export default useRequest;
