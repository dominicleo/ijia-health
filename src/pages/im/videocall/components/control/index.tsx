import classnames from 'classnames';
import * as React from 'react';
import { CoverView, CoverImage } from 'remax/wechat';
import { getDurationText } from './utils';
import useUnmount from '@/hooks/useUnmount';
import AnswerImage from '../../images/icon-answer.png';
import AnswerActiveImage from '../../images/icon-answer-active.png';
import HangupImage from '../../images/icon-hangup.png';
import HangupActiveImage from '../../images/icon-hangup-active.png';
import MuteImage from '../../images/icon-mute.png';
import MuteActiveImage from '../../images/icon-mute-active.png';
import HandsFreeImage from '../../images/icon-hands-free.png';
import HandsFreeActiveImage from '../../images/icon-hands-free-active.png';
import CameraImage from '../../images/icon-camera.png';
import s from './index.module.less';

interface ControlPropsType {
  /** 呼叫模式 calling 主叫，becalling 被叫 */
  mode: 'calling' | 'becalling';
  /** 通话方式 */
  type: 'video' | 'voice';
  /** 是否正在通话 */
  thecall?: boolean;
  /** 静音 */
  muted?: boolean;
  /** 免提 */
  handsfree?: boolean;
  onAccept?: any;
  onReject?: any;
  onCancel?: any;
  onSwitchVoice?: any;
  onSwitchCamera?: any;
  onSwitchMute?: any;
  onSwitchHandsfree?: any;
}

const ControlButton = React.memo((props: any) => {
  const { icon, activeIcon, active, text, onClick } = props;
  const [clicked, setClicked] = React.useState(false);

  const onTouchStart = () => setClicked(true);
  const onTouchEnd = () => setClicked(false);

  const image = (clicked || active) && activeIcon ? activeIcon : icon;

  return (
    <CoverView className={s.action} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <CoverImage src={image} onClick={onClick} className={classnames(s.icon)} />
      <CoverView className={s.text}>{text}</CoverView>
    </CoverView>
  );
});

const AcceptControlButton = (props: any) => (
  <ControlButton
    text='接听'
    icon={AnswerImage}
    activeIcon={AnswerActiveImage}
    onClick={props.onClick}
  />
);
const RejectControlButton = (props: any) => (
  <ControlButton
    text='拒绝'
    icon={HangupImage}
    activeIcon={HandsFreeActiveImage}
    onClick={props.onClick}
  />
);
const CancelControlButton = (props: any) => {
  const { text = '取消' } = props;
  return <ControlButton text={text} icon={HangupImage} onClick={props.onClick} />;
};

const SwitchVoiceControlButton = (props: any) => (
  <ControlButton text='切到语音通话' icon={HangupImage} onClick={props.onClick} />
);

const SwitchCameraControlButton = (props: any) => (
  <ControlButton text='切换摄像头' icon={CameraImage} onClick={props.onClick} />
);

const FlexWrapper = React.memo(({ center, children }: any) => {
  return (
    <CoverView className={classnames(s.flexWrapper, { [s.center]: center })}>{children}</CoverView>
  );
});

const VideoControlCompose = React.memo((props: any) => {
  return (
    <FlexWrapper>
      {/* <SwitchVoiceControlButton onClick={props.onSwitchVoice} /> */}
      <CancelControlButton text='挂断' onClick={props.onCancel} />
      <SwitchCameraControlButton onClick={props.onSwitchCamera} />
    </FlexWrapper>
  );
});

const VoiceControlCompose = React.memo((props: any) => {
  return (
    <FlexWrapper>
      <ControlButton
        text='静音'
        icon={MuteImage}
        active={props.muted}
        activeIcon={MuteActiveImage}
        onClick={props.onSwitchMute}
      />
      <CancelControlButton text='挂断' onClick={props.onCancel} />
      <ControlButton
        text='免提'
        icon={HandsFreeImage}
        active={props.handsfree}
        activeIcon={HandsFreeActiveImage}
        onClick={props.onSwitchHandsfree}
      />
    </FlexWrapper>
  );
});

const CallingVideoControlCompose = React.memo((props: any) => {
  return (
    <>
      {/* <SwitchVoiceControlButton /> */}
      <CancelControlButton onClick={props.onCancel} />
    </>
  );
});

const BecallingVideoControlCompose = React.memo((props: any) => {
  return (
    <FlexWrapper>
      <RejectControlButton onClick={props.onReject} />
      <CoverView>
        {/* <SwitchVoiceControlButton /> */}
        <AcceptControlButton onClick={props.onAccept} />
      </CoverView>
    </FlexWrapper>
  );
});

const CallingVoiceControlCompose = React.memo((props: any) => {
  return (
    <FlexWrapper center>
      <CancelControlButton onClick={props.onCancel} />
    </FlexWrapper>
  );
});
const BecallingVoiceControlCompose = React.memo((props: any) => {
  return (
    <FlexWrapper>
      <RejectControlButton onClick={props.onReject} />
      <AcceptControlButton onClick={props.onAccept} />
    </FlexWrapper>
  );
});

const ControlCompose = React.memo((props: any) => {
  const { thecall, isVoice, mode, ...restProps } = props;
  // 正在通话
  if (thecall) {
    return isVoice ? (
      <VoiceControlCompose {...restProps} />
    ) : (
      <VideoControlCompose {...restProps} />
    );
  }

  // 主叫等待
  if (mode === 'calling') {
    return isVoice ? (
      <CallingVoiceControlCompose {...restProps} />
    ) : (
      <CallingVideoControlCompose {...restProps} />
    );
  }

  // 被叫等待
  if (mode === 'becalling') {
    return isVoice ? (
      <BecallingVoiceControlCompose {...restProps} />
    ) : (
      <BecallingVideoControlCompose {...restProps} />
    );
  }

  return <></>;
});

let timer: any;

export default (props: ControlPropsType) => {
  const {
    mode,
    type,
    thecall = false,
    muted,
    handsfree,
    onAccept,
    onCancel,
    onReject,
    onSwitchVoice,
    onSwitchCamera,
    onSwitchMute,
    onSwitchHandsfree,
  } = props;

  const timestamp = React.useRef(0);
  const [duration, setDuration] = React.useState('');

  const isVoice = type === 'voice';

  const setTimer = () => {
    timer = setInterval(() => {
      const text = getDurationText(timestamp.current++);
      setDuration(text);
    }, 1000);
  };

  const clearTimer = () => {
    timer && clearInterval(timer);
    timer = null;
  };

  // 通话状态变更
  React.useEffect(() => {
    if (thecall) {
      setTimer();
      return;
    }
    clearTimer();
  }, [thecall]);

  // 组件卸载
  useUnmount(() => {
    clearTimer();
  });

  const controlComposeProps = React.useMemo(() => {
    return {
      thecall,
      isVoice,
      mode,
      muted,
      handsfree,
      onAccept,
      onCancel,
      onReject,
      onSwitchVoice,
      onSwitchCamera,
      onSwitchMute,
      onSwitchHandsfree,
    };
  }, [thecall, isVoice, mode, muted, handsfree]);

  return (
    <CoverView className={s.wrapper}>
      {thecall && <CoverView className={s.duration}>{duration}</CoverView>}
      <ControlCompose {...controlComposeProps} />
    </CoverView>
  );
};
