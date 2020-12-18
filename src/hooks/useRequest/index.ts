import { useContext } from 'react';

import ConfigContext from './configContext';
import {
  BaseOptions,
  BaseResult,
  CombineService,
  LoadMoreFormatReturn,
  LoadMoreOptions,
  LoadMoreOptionsWithFormat,
  LoadMoreParams,
  LoadMoreResult,
  OptionsWithFormat,
} from './types';
import useAsync from './useAsync';
import useLoadMore from './useLoadMore';

function useRequest<R = any, P extends any[] = any, U = any, UU extends U = any>(
  service: CombineService<R, P>,
  options: OptionsWithFormat<R, P, U, UU>,
): BaseResult<U, P>;

function useRequest<R = any, P extends any[] = any>(
  service: CombineService<R, P>,
  options?: BaseOptions<R, P>,
): BaseResult<R, P>;

function useRequest<R extends LoadMoreFormatReturn, RR>(
  service: CombineService<RR, LoadMoreParams<R>>,
  options: LoadMoreOptionsWithFormat<R, RR>,
): LoadMoreResult<R>;
function useRequest<R extends LoadMoreFormatReturn, RR extends R>(
  service: CombineService<R, LoadMoreParams<R>>,
  options: LoadMoreOptions<RR>,
): LoadMoreResult<R>;

function useRequest(service: any, options: any = {}) {
  const contextConfig = useContext(ConfigContext);
  const finalOptions = { ...contextConfig, ...options };

  const { loadMore } = finalOptions;

  if (loadMore) {
    return useLoadMore(service, finalOptions);
  }

  return useAsync(service, finalOptions);
}

const UseRequestProvider = ConfigContext.Provider;

export { UseRequestProvider };

export default useRequest;
