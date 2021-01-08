import { MESSAGE } from '@/constants';
import { getUpdateManager, showModal } from 'remax/wechat';
import { noop } from '.';

const updateManager = getUpdateManager();

/** 检查是否有新版本 */
export const checkUpdate = (): Promise<boolean> => {
  const updateManager = getUpdateManager();
  return new Promise((resolve) => {
    updateManager.onCheckForUpdate(({ hasUpdate }) => resolve(hasUpdate));
  });
};

/** 请求更新到最新版 */
export const requestUpdate = () => {
  return new Promise((resolve, reject) => {
    updateManager.onCheckForUpdate(noop);
    updateManager.onUpdateReady(() => {
      showModal({
        title: MESSAGE.SYSTEM_PROMPT,
        content: '您需要重启小程序更新缓存数据',
        showCancel: false,
        confirmText: '重启',
        success: ({ confirm }) => {
          if (confirm) {
            updateManager.applyUpdate();
            resolve(undefined);
          }
        },
      });
    });
    updateManager.onUpdateFailed((error) => reject(new Error(error.errMsg)));
  });
};
