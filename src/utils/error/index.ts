// @ts-nocheck

import { showModal, showToast } from 'remax/wechat';

import Toast from '@/components/toast';
import { MESSAGE } from '@/constants';
import PAGE from '@/constants/page';

import history from '../history';
import AuthorizeError from './authorize';
import NetworkError from './network';
import ServerError from './server';
import ServiceError from './service';

export const handleError = (error: Error) => {
  Toast.clear();

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
    showModal({
      title: MESSAGE.SYSTEM_PROMPT,
      content: error.message,
      confirmText: MESSAGE.GOT_IT,
      showCancel: false,
    });
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
