import '@/utils/uma';
import './app.less';

import * as React from 'react';
import { useAppEvent } from 'remax/runtime';
import { getSystemInfoSync, loadFontFace, setInnerAudioOption } from 'remax/wechat';
import { Provider } from 'unstated';

import { UseRequestProvider } from './hooks/useRequest';
import { handleError } from './utils/error';
import { requestUpdate } from './utils/update';
import GlobalData from './utils/globalData';
import Yunxin from './utils/im';
import { getCurrentPage } from './utils';
import { SHARE_MESSAGE_DEFAULT_PARAMS } from './hooks/useShareMessage';

loadFontFace({
  global: true,
  family: 'DIN',
  source: `url("https://m.ijia120.com/fonts/DIN-Medium.ttf")`,
}).catch(() => {});

// polyfill for finally
if (!Promise.prototype.finally) {
  Promise.prototype.finally = function (callback: any) {
    const promise: any = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) =>
        promise.resolve(callback()).then(() => {
          throw reason;
        }),
    );
  };
}

// 重写全局分享参数
if (wx.onAppRoute) {
  wx.onAppRoute(() => {
    const page = getCurrentPage();
    if (!page || page?.data?.__SHARE_MESSAGE__) return;
    page.onShareAppMessage = () => SHARE_MESSAGE_DEFAULT_PARAMS;
  });
}

const App: React.FC = (props) => {
  const { platform } = getSystemInfoSync();

  useAppEvent('onLaunch', () => {
    GlobalData.isPushBeCallPage = false;
    requestUpdate();
  });

  useAppEvent('onShow', (event) => {
    // 从微信 im 分享卡片进入则销毁云信实例
    if (event.scene == 1007 || event.scene == 1008) {
      Yunxin.destroy();
    }

    if (platform !== 'devtools') {
      setInnerAudioOption({
        mixWithOther: false,
        obeyMuteSwitch: false,
      });
    }
  });

  // 捕获全局同步异常
  useAppEvent('onError', (error) => {
    handleError(error);
  });

  // 捕获全局 promise.reject
  useAppEvent('onUnhandledRejection', ({ promise }) => {
    promise.catch(handleError);
  });

  return (
    <Provider>
      <UseRequestProvider
        value={{
          throwOnError: true,
          onError: handleError,
        }}
      >
        {props.children as React.ReactElement}
      </UseRequestProvider>
    </Provider>
  );
};

export default App;
