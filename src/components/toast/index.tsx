import * as React from 'react';

import VantToastComponent from '@vant/weapp/lib/toast';
import VantToast, { VantToastStatic } from '@vant/weapp/lib/toast/toast';

VantToast.setDefaultOptions({
  // selector: DEFAULT_SELECTOR,
  duration: 3000,
  forbidClick: true,
});

interface ToastComponentProps {
  /** 标识符 */
  id?: string;
}

const ToastComponent: React.FC<ToastComponentProps> = ({ id, children }) => {
  return <VantToastComponent id={id}>{children}</VantToastComponent>;
};

ToastComponent.defaultProps = {
  id: 'van-toast',
};

interface Toast extends VantToastStatic {
  Component: React.FC<ToastComponentProps>;
}

const Toast = VantToast as Toast;

Toast.Component = ToastComponent;

export default Toast;
