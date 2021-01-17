import { usePageEvent } from 'remax/runtime';

import { APP_NAME } from '@/constants/common';
import PAGE from '@/constants/page';
import { getCurrentPage, isFunction, isPlainObject } from '@/utils';
import GlobalData from '@/utils/globalData';

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

export const SHARE_MESSAGE_DEFAULT_PARAMS: useShareMessageResult = {
  title: APP_NAME,
  path: PAGE.INDEX,
  imageUrl: 'https://m.ijia120.com/miniprograms/share.png',
};

const useShareMessage = (
  options?:
    | useShareMessageResult
    | ((params: useShareMessageCallbackParams) => useShareMessageResult),
) => {
  const page = getCurrentPage();
  page && (page.data.__SHARE_MESSAGE__ = true);

  usePageEvent('onShareAppMessage', async (params) => {
    const config = isFunction(options) ? await options(params) : options;
    return {
      title: config?.title || SHARE_MESSAGE_DEFAULT_PARAMS.title,
      path: config?.path || SHARE_MESSAGE_DEFAULT_PARAMS.path,
      imageUrl: config?.imageUrl || SHARE_MESSAGE_DEFAULT_PARAMS.imageUrl,
    };
  });
};

export default useShareMessage;
