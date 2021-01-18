import * as React from 'react';
import { usePageInstance } from 'remax';
import { View, LivePlayer, createLivePlayerContext } from 'remax/wechat';
import s from './index.module.less';
import { isFunction } from '@/utils';

interface PlayerPropsType {
  style?: any;
  id: string;
  url?: string;
  orientation?: 'vertical' | 'horizontal';
  objectFit?: 'fillCrop' | 'contain';
  soundMode?: 'speaker' | 'ear';
  onError?: any;
  children?: any;
  instance?: any;
}

let LivePlayerContext: WechatMiniprogram.LivePlayerContext;

class Player extends React.Component<PlayerPropsType, any> {
  static defaultProps = {
    orientation: 'vertical',
    objectFit: 'fillCrop',
    soundMode: 'speaker',
  };
  constructor(props: PlayerPropsType) {
    super(props);
    this.state = {
      detached: false,
      status: 'loading',
      orientation: props.orientation,
      objectFit: props.objectFit,
    };
  }

  componentDidMount() {
    if (!LivePlayerContext) {
      LivePlayerContext = createLivePlayerContext(this.props.id, this.props.instance);
    }
    if (this.props.url) {
      this.start();
    }
  }

  start = () => {
    if (this.state.status === 'ready') {
      return;
    }
    if (this.state.detached) {
      console.log(`try to start player while component already detached`);
      return;
    }
    LivePlayerContext.play();
  };

  stop() {
    createLivePlayerContext(this.props.id, this.props.instance).stop();
  }

  changeOrientation(isHorizontal: boolean) {
    const orientation = isHorizontal ? 'horizontal' : 'vertical';
    this.setState({
      orientation,
    });
  }

  changeObjectFit(isFillCrop: boolean) {
    const objectFit = isFillCrop ? 'fillCrop' : 'contain';
    this.setState({
      objectFit,
    });
  }

  onStateChange = (event: any) => {
    console.log('Player', 'onStateChange', event);
    const { code } = event.detail;
    if (code === 2004) {
      if (this.state.status === 'loading') {
        this.setState({ status: 'ready' });
      }
      return;
    }

    if (code === -2301) {
      this.setState({ status: 'error' });
      // @ts-ignore
      isFunction(this.props.onError) && this.props.onError(event);
    }
  };

  render() {
    const { style, id, url, soundMode, children } = this.props;
    const { orientation, objectFit } = this.state;

    return (
      <View className={s.wrapper} style={style}>
        <LivePlayer
          className={s.player}
          id={id}
          src={url}
          mode='RTC'
          orientation={orientation}
          objectFit={objectFit}
          minCache={0.2}
          maxCache={0.8}
          soundMode={soundMode}
          onStateChange={this.onStateChange}
          autoplay
        >
          {children}
        </LivePlayer>
      </View>
    );
  }
}

const Wrapper = (props: any) => {
  const instance = usePageInstance();
  return <Player {...props} instance={instance} />;
};

export default Wrapper;
