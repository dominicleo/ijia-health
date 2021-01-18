import classnames from 'classnames';
import * as React from 'react';
import { CoverImage, CoverView, nextTick, TouchEvent, View } from 'remax/wechat';

import date from '@/utils/date';
import { NETCALL_TYPE } from '@/utils/im';

import { CONTROL_TYPE } from '../types.d';
import CONTROL, { CONTROL_TEXT } from './controls';
import s from './index.less';

interface FlexProps {
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between';
}

const Flex: React.FC<FlexProps> = ({ justify, children }) => {
  return <CoverView className={classnames(s.flex, justify && s[justify])}>{children}</CoverView>;
};

Flex.defaultProps = {
  justify: 'start',
};

const Timer: React.FC = React.memo(() => {
  const time = React.useRef(0);
  const timer = React.useRef<NodeJS.Timeout>();
  const [text, setText] = React.useState('00:00:00');

  const setTime = () => {
    setText(date.duration(time.current++, 'second').format('HH:mm:ss'));
  };

  const run = () => {
    setTime();
    timer.current && clearInterval(timer.current);
    timer.current = setInterval(setTime, 1000);
  };

  React.useEffect(() => {
    nextTick(run);
    return () => {
      timer.current && clearInterval(timer.current);
    };
  }, []);

  return (
    <Flex justify='center'>
      <CoverView className={s.timer}>{text}</CoverView>
    </Flex>
  );
});

interface ControlButtonProps {
  type: CONTROL_TYPE;
  active?: boolean;
  onClick?: (event: TouchEvent) => void;
}

const ControlButton: React.FC<ControlButtonProps> = (props) => {
  const [press, setPress] = React.useState(false);

  const { normal, hover, active } = CONTROL[props.type];
  const label = CONTROL_TEXT[props.type];

  let image = normal;

  if (press && hover) {
    image = props.active ? active : hover;
  } else if (props.active) {
    image = active;
  }

  return (
    <CoverView className={classnames(s.control, s[props.type])}>
      <View
        onClick={props.onClick}
        onTouchStart={() => setPress(true)}
        onTouchCancel={() => setPress(false)}
        onTouchEnd={() => setPress(false)}
      >
        <CoverImage src={image} />
        <CoverView className={s.label}>{label}</CoverView>
      </View>
    </CoverView>
  );
};

interface ControlProps {
  /** 通话类型 */
  type: NETCALL_TYPE;
  /** (default: false) 静音状态 */
  mute?: boolean;
  /** (default: false) 免提 */
  handsfree?: boolean;
  /** 是否被叫 */
  becalling?: boolean;
  /** 是否等待接听中 */
  loading?: boolean;
  /** 点击接听 */
  onAnswer?: (event?: TouchEvent) => void;
  /** 点击挂断 */
  onHangup?: (event?: TouchEvent) => void;
  /** 点击免提 */
  onHandsfree?: (event?: TouchEvent) => void;
  /** 点击静音 */
  onMute?: (event?: TouchEvent) => void;
  /** 切换摄像头 */
  onSwitchCamera?: (event?: TouchEvent) => void;
  /** 切换到语音 */
  onSwitchVoice?: (event?: TouchEvent) => void;
}

const Control: React.FC<ControlProps> = React.memo(
  ({ type, mute, handsfree, becalling, loading, ...props }) => {
    const isVoice = type === NETCALL_TYPE.AUDIO;

    const timer = React.useMemo(() => <Timer />, []);

    // 语音通话控制按钮
    let VoiceControl;
    // 视频通话控制按钮
    let VideoControl;

    if (loading) {
      VoiceControl = becalling ? (
        <Flex justify='space-between'>
          <ControlButton type={CONTROL_TYPE.HANGUP} onClick={props.onHangup} />
          <ControlButton type={CONTROL_TYPE.ANSWER} onClick={props.onAnswer} />
        </Flex>
      ) : (
        <Flex justify='center'>
          <ControlButton type={CONTROL_TYPE.CANCEL} onClick={props.onHangup} />
        </Flex>
      );
      VideoControl = becalling ? (
        <>
          <Flex justify='end'>
            <ControlButton type={CONTROL_TYPE.ICON_CUTVIDEO} onClick={props.onSwitchVoice} />
          </Flex>
          <Flex justify='space-between'>
            <ControlButton type={CONTROL_TYPE.HANGUP} onClick={props.onHangup} />
            <ControlButton type={CONTROL_TYPE.ANSWER} onClick={props.onAnswer} />
          </Flex>
        </>
      ) : (
        <>
          <Flex justify='center'>
            <ControlButton type={CONTROL_TYPE.ICON_CUTVIDEO} onClick={props.onSwitchVoice} />
          </Flex>
          <Flex justify='center'>
            <ControlButton type={CONTROL_TYPE.CANCEL} onClick={props.onHangup} />
          </Flex>
        </>
      );
    } else {
      VoiceControl = (
        <>
          <Flex justify='center'>{timer}</Flex>
          <Flex justify='space-between'>
            <ControlButton type={CONTROL_TYPE.MUTE} active={mute} onClick={props.onMute} />
            <ControlButton type={CONTROL_TYPE.HANGUP} onClick={props.onHangup} />
            <ControlButton
              type={CONTROL_TYPE.HANDSFREE}
              active={handsfree}
              onClick={props.onHandsfree}
            />
          </Flex>
        </>
      );

      VideoControl = (
        <>
          <Flex justify='center'>{timer}</Flex>
          <Flex justify='space-between'>
            <ControlButton
              type={CONTROL_TYPE.CUTVIDEO}
              active={mute}
              onClick={props.onSwitchVoice}
            />
            <ControlButton type={CONTROL_TYPE.HANGUP} onClick={props.onHangup} />
            <ControlButton type={CONTROL_TYPE.CUTCAMERA} onClick={props.onSwitchCamera} />
          </Flex>
        </>
      );
    }

    return <View className={s.wrapper}>{isVoice ? VoiceControl : VideoControl}</View>;
  },
);

export default Control;
