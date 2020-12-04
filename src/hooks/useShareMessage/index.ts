import { usePageEvent } from 'remax/runtime';

import { APP_NAME } from '@/constants/common';
import PAGE from '@/constants/page';
import { isFunction } from '@/utils';

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

const useShareMessage = (
  options?:
    | useShareMessageResult
    | ((params?: useShareMessageCallbackParams) => useShareMessageResult),
) => {
  usePageEvent('onShareAppMessage', (params) => {
    return Object.assign(
      {
        title: APP_NAME,
        path: PAGE.INDEX,
        imageUrl: 'https://m.ijia120.com/miniprograms/share.png',
      },
      isFunction(options) ? options(params) : options,
    );
  });
};

export default useShareMessage;
