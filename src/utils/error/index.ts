import { hideLoading, hideToast, showModal, showToast } from 'remax/wechat';

import Toast from '@/components/toast';
import { MESSAGE } from '@/constants';
import PAGE from '@/constants/page';

import history from '../history';
import AuthorizeError from './authorize';
import NetworkError from './network';
import ServerError from './server';
import ServiceError from './service';
import { noop } from '..';

export const handleError = (error: Error | string) => {
  if (/^useRequest has caught the exception/.test(error as string)) return;
  Toast.clear();
  hideLoading();
  hideToast();

  if (AuthorizeError.is(error)) {
    history.push(PAGE.AUTHORIZE, { redirect: error.redirect });
    return;
  }
  if (ServiceError.is(error)) {
    showToast({
      icon: 'none',
      title: error.message,
      duration: 3000,
      mark: true,
    });
    return;
  }
  if (ServerError.is(error)) {
    showToast({ title: error.message, icon: 'none', mask: true });
    return;
  }
  if (NetworkError.is(error)) {
    showModal({
      title: MESSAGE.SYSTEM_PROMPT,
      content: error.message,
      confirmText: MESSAGE.GOT_IT,
      showCancel: false,
    });
    return;
  }

  console.error(error);
};

export { NetworkError, AuthorizeError, ServiceError, ServerError };
