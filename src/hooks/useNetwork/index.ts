import { useEffect, useState } from 'react';
import { onNetworkStatusChange } from 'remax/wechat';

export interface NetworkState {
  since?: Date;
  online?: boolean;
  networkType?: 'wifi' | '2g' | '3g' | '4g' | '5g' | unknown | 'none';
}

function useNetwork(): NetworkState {
  const [state, setState] = useState(() => {
    return {
      since: new Date(),
      online: navigator.onLine,
    };
  });

  useEffect(() => {
    const onConnectionChange = ({
      isConnected,
      networkType,
    }: WechatMiniprogram.OnNetworkStatusChangeCallbackResult) => {
      setState((prevState) => ({
        ...prevState,
        online: isConnected,
        networkType,
        since: new Date(),
      }));
    };

    onNetworkStatusChange(onConnectionChange);

    return () => {
      wx.offNetworkStatusChange(onConnectionChange);
    };
  }, []);

  return state;
}

export default useNetwork;
