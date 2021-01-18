import { showToast, hideToast, showLoading, hideLoading } from 'remax/wechat';
import { isNumber, isBoolean, isFunction } from '@/utils';

const MASK = true;
const DURATION = 3000;

let timer: any;

function notice(content: any, type: string, duration = DURATION, onClose: any, mask = MASK) {
  const toastMask = isBoolean(mask) ? mask : MASK;
  const timeout = isNumber(duration) ? duration : DURATION;
  if (type === 'loading') {
    showLoading({
      title: content || '',
      mask: toastMask,
      success() {
        if (timeout) {
          timer && clearTimeout(timer);
          timer = setTimeout(() => {
            isFunction(onClose) && onClose();
            hideLoading();
          }, timeout);
          return;
        }
        isFunction(onClose) && onClose();
      },
    });
    return;
  }

  let icon = 'none';
  if (type === 'success') {
    icon = 'success';
  }

  showToast({
    title: content || '',
    // @ts-ignore
    icon,
    mask: toastMask,
    duration: timeout,
    success: () => {
      if (duration) {
        timer && clearTimeout(timer);
        timer = setTimeout(() => {
          isFunction(onClose) && onClose();
          hideToast();
        }, duration);
        return;
      }
      isFunction(onClose) && onClose();
    },
  });
}

export default {
  success(content: any, duration?: number, onClose?: () => void, mask?: boolean) {
    return notice(content, 'success', duration, onClose, mask);
  },
  fail(content: any, duration?: number, onClose?: () => void, mask?: boolean) {
    return notice(content, 'fail', duration, onClose, mask);
  },
  info(content: any, duration?: number, onClose?: () => void, mask?: boolean) {
    return notice(content, 'info', duration, onClose, mask);
  },
  loading(content: any, duration?: number, onClose?: () => void, mask?: boolean) {
    return notice(content, 'loading', duration, onClose, mask);
  },
  hide() {
    hideToast();
    hideLoading();
  },
};
