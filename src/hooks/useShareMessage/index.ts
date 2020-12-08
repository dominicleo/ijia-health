import { usePageEvent } from 'remax/runtime';

import { APP_NAME } from '@/constants/common';
import PAGE from '@/constants/page';
import { isFunction, isPlainObject } from '@/utils';

type useShareMessageResult = {
  title?: string;
  path?: string;
  imageUrl?: string;
};

type useShareMessageCallbackParams = {
  /** 转发事件来源 */
  from: 'button' | 'menu';
  target: any;
  webViewUrl: string;
};

const DEFAULTS: useShareMessageResult = {
  title: APP_NAME,
  path: PAGE.INDEX,
  imageUrl: 'https://m.ijia120.com/miniprograms/share.png',
};

const useShareMessage = (
  options?:
    | useShareMessageResult
    | ((params: useShareMessageCallbackParams) => useShareMessageResult),
) => {
  usePageEvent('onShareAppMessage', async (params) => {
    const config = isFunction(options) ? await options(params) : options;

    return {
      title: config?.title || DEFAULTS.title,
      path: config?.path || DEFAULTS.path,
      imageUrl: config?.imageUrl || DEFAULTS.imageUrl,
    };
  });
};

export default useShareMessage;
