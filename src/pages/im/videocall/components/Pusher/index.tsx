import * as React from 'react';
import { View, LivePusher, createLivePusherContext } from 'remax/wechat';
import s from './index.module.less';

interface PusherPropsType {
  style?: any;
  url?: string;
  beauty?: number;
  whiteness?: number;
  muted?: boolean;
  aspect?: '3:4' | '9:16';
  enableCamera?: boolean;
  onError?: any;
  children?: any;
}

let LivePusherContext: WechatMiniprogram.LivePusherContext;

export default class Pusher extends React.Component<PusherPropsType> {
  static defaultProps = {
    aspect: '3:4',
    beauty: 0,
    muted: false,
    enableCamera: true,
  };
  state = {
    detached: false,
    status: 'loading',
  };

  start(options = {}) {
    if (!LivePusherContext) {
      LivePusherContext = createLivePusherContext();
    }
    LivePusherContext.start(options);
  }

  stop(options = {}) {
    if (!LivePusherContext) return;
    LivePusherContext.stop(options);
  }

  switchCamera() {
    LivePusherContext.switchCamera();
  }

  snapshot() {
    LivePusherContext.snapshot();
  }

  onStateChange = (event: any) => {
    console.log('Pusher', 'onStateChange', event);
    const { code } = event.detail;
    if (code === -1037) {
      this.setState({ status: 'error' });
      LivePusherContext.stop({
        complete: () => {
          LivePusherContext.start();
        },
      });
      // @ts-ignore
      isFunction(this.props.onError) && this.props.onError(event);
      return;
    }

    if (code === 1008) {
      // 编码器启动
      if (this.state.status === 'loading') {
        this.setState({ status: 'ready' });
      }
    }
  };

  onNetChangeStatus = (event: any) => {
    console.log('onNetChangeStatus', event);
  };

  render() {
    const { style, url, aspect, beauty, whiteness, muted, enableCamera, children } = this.props;

    return (
      <View className={s.wrapper} style={style}>
        <LivePusher
          className={s.pusher}
          url={url}
          mode='RTC'
          aspect={aspect}
          beauty={beauty}
          whiteness={whiteness}
          muted={muted}
          maxBitrate={500}
          minBitrate={200}
          onStateChange={this.onStateChange}
          onNetStatus={this.onNetChangeStatus}
          enableCamera={enableCamera}
          autopush
        >
          {children}
        </LivePusher>
      </View>
    );
  }
}
