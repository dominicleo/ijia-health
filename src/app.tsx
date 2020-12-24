import './app.less';

import * as React from 'react';
import { useAppEvent } from 'remax/runtime';
import { loadFontFace } from 'remax/wechat';

import { UseRequestProvider } from './hooks/useRequest';
import { handleError } from './utils/error';
import Provider from './utils/unstated/provider';

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

const App: React.FC = (props) => {
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
          // throwOnError: true,
          onError: handleError,
        }}
      >
        {props.children as React.ReactElement}
      </UseRequestProvider>
    </Provider>
  );
};

export default App;
