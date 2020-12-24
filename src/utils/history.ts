import qs from 'qs';
import {
  getStorage,
  hideLoading,
  navigateBack,
  navigateTo,
  redirectTo,
  reLaunch,
  showLoading,
  switchTab,
} from 'remax/wechat';

import { STORAGE, TABBAR } from '@/constants';
import PAGE from '@/constants/page';
import { UserService } from '@/services';

import { isFunction, isString, noop } from './';
import { AuthorizeError, ServerError } from './error';

async function checkAuthorize(redirect?: string) {
  const token = await getStorage({ key: STORAGE.ACCESS_TOKEN })
    .then(({ data }) => data)
    .catch(noop);

  const cb = () => {
    throw new AuthorizeError('not authorize', redirect);
  };

  !token && cb();

  showLoading({ title: '', mask: true });
  await UserService.checkAuthorize()
    .catch((error) => {
      AuthorizeError.is(error) && cb();
    })
    .finally(() => hideLoading());
}

export function createURL<T extends object>(url: string, query?: T) {
  const [originalURL, originalQuery] = String(url).split('?');
  const querystring = qs.stringify({ ...qs.parse(originalQuery), ...query });
  return [originalURL, querystring].filter(Boolean).join('?');
}

type Pathname = string;

interface LocationOptions {
  /** (default: false) 是否校验权限 */
  authorize?: boolean;
  /** (default: false) 关闭所有页面，打开到应用内的某个页面 */
  reLaunch?: boolean;
  /** 页面间通信接口，用于监听被打开页面发送到当前页面的数据 */
  events?: object;
}

interface LocationConfig<T> extends LocationOptions {
  /** 页面路径 */
  pathname: Pathname;
  /** 页面参数 (tabbar 页面参数无效) */
  query?: T;
}

type PushResult = Promise<WechatMiniprogram.NavigateToSuccessCallbackResult['eventChannel'] | void>;

async function goto(url: string, config: LocationConfig<object>, callback?: Function) {
  if (config.authorize) {
    await checkAuthorize(url);
  }

  if (config?.reLaunch) {
    return reLaunch({ url }).then(noop);
  }

  if (TABBAR.PATHS.find((path) => config.pathname.includes(path))) {
    return switchTab({ url }).then(noop);
  }

  if (isFunction(callback)) {
    return callback();
  }
}

function push<T>(data: LocationConfig<T>): PushResult;
function push<T>(data: Pathname, query?: T, options?: LocationOptions): PushResult;
async function push<T extends object>(
  data: LocationConfig<T> | Pathname,
  query?: T,
  options: LocationOptions = {},
): PushResult {
  const config = isString(data) ? { pathname: data, query, ...options } : data;
  const url = createURL(config.pathname, config.query);

  return goto(url, config, () =>
    navigateTo({ url, events: config.events }).then(({ eventChannel }) => eventChannel),
  );
}

function replace<T>(data: LocationConfig<T>): Promise<void>;
function replace<T>(data: Pathname, query?: T, options?: LocationOptions): Promise<void>;
async function replace<T extends object>(
  data: LocationConfig<T> | Pathname,
  query?: T,
  options: LocationOptions = {},
): Promise<void> {
  const config = isString(data) ? { pathname: data, query, ...options } : data;
  const url = createURL(config.pathname, config.query);

  return goto(url, config, () => redirectTo({ url }).then(noop));
}

function back(delta = 1): Promise<void> {
  if (history.length === 1) {
    return reLaunch({ url: PAGE.INDEX }).then(noop);
  }
  return navigateBack({ delta }).then(noop);
}

const history = {
  push,
  replace,
  back,
  get length() {
    const pages = getCurrentPages();
    return pages.length;
  },
};

export default history;
