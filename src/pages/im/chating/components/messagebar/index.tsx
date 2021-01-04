import classnames from 'classnames';
import * as React from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { usePageEvent } from 'remax/macro';
import {
  authorize,
  CoverView,
  getRecorderManager,
  getSetting,
  hideKeyboard,
  hideToast,
  Input,
  nextTick,
  openSetting,
  showModal,
  showToast,
  View,
} from 'remax/wechat';

import { MESSAGE } from '@/constants';

import {
  keyboardHeightState,
  valueState,
  focusState,
  toolbarState,
  messagebarState,
} from '../atoms';
import ChatingContext from '../context';
import { CHATING_MESSAGEBAR, CHATING_TOOLBAR, MESSAGEBAR_ACTION_TYPE } from '../types.d';
import s from './index.less';

const InputBar = React.memo(() => {
  const { messagebar$ } = React.useContext(ChatingContext);
  const [value, setValue] = useRecoilState(valueState);
  const [focus, setFocus] = useRecoilState(focusState);
  const setkeyboardHeight = useSetRecoilState(keyboardHeightState);
  const [toolbar, setToolbar] = useRecoilState(toolbarState);

  const onFocus = () => {
    if (focus) return;
    toolbar !== CHATING_TOOLBAR.HIDDEN && setToolbar(CHATING_TOOLBAR.HIDDEN);
    setFocus(true);
  };

  const onBlur = () => {
    if (!focus) return;
    setFocus(false);
    hideKeyboard();
  };

  return (
    <Input
      value={value}
      focus={focus}
      className={classnames(s.input, { [s.placeholder]: toolbar === CHATING_TOOLBAR.EMOJI })}
      placeholderClassName={s.placeholder}
      placeholder='请仔细描述你的问题'
      onConfirm={(event) =>
        messagebar$?.emit({ type: MESSAGEBAR_ACTION_TYPE.SEND, payload: event.detail.value })
      }
      onFocus={onFocus}
      onBlur={onBlur}
      onInput={(event) => setValue(event.detail.value)}
      onKeyboardHeightChange={(event) => setkeyboardHeight(event.detail.height)}
      adjustPosition={false}
      confirmType='send'
      confirmHold
    />
  );
});

// 最大录音时长
const RECORDER_MAX_TIME = 60 * 2 * 1000;
// 最小录音时长
const RECORDER_MIN_TIME = 2000;

const RECORDER_AUTH_NAME = 'scope.record';

const SpeakBar: React.FC = React.memo(() => {
  const { messagebar$ } = React.useContext(ChatingContext);
  const [speaking, setSpeaking] = React.useState(false);
  const [recordAuthorize, setRecordAuthorize] = React.useState<boolean | undefined>();
  const recorder = React.useRef(getRecorderManager());

  usePageEvent('onShow', () => {
    getSetting().then(({ authSetting }) => setRecordAuthorize(authSetting[RECORDER_AUTH_NAME]));
  });

  // 开始录音
  const handleRecorder = () => {
    setSpeaking(true);
    showToast({ title: '正在录音', duration: 60 * 60 * 1000 * 24, icon: 'none' });
    if (!recorder.current) return;
    recorder.current.start({ duration: RECORDER_MAX_TIME, format: 'mp3' });
    recorder.current.onStop((response) => {
      if (response.duration < RECORDER_MIN_TIME) {
        showToast({ title: '录音时间太短', icon: 'none' });
        setSpeaking(false);
        return;
      }
      messagebar$?.emit({
        type: MESSAGEBAR_ACTION_TYPE.SEND,
        payload: { type: 'audio', payload: response },
      });
    });

    recorder.current.onError((error) => {
      showToast({ title: `录音失败[${error.errMsg}]`, icon: 'none' });
      setSpeaking(false);
      recorder.current.stop();
    });
  };

  const onClickRecorderAuthorize = () => {
    openSetting({
      success: ({ authSetting }: WechatMiniprogram.OpenSettingSuccessCallbackResult) => {
        const record = authSetting[RECORDER_AUTH_NAME];
        if (record === true) {
          showToast({ title: '授权成功', mask: true });
          return;
        }
        showToast({ title: '请授权录音功能以发送语音' });
      },
    });
  };

  const checkRecorderAuthorize = (cb?: () => void) =>
    getSetting({
      success({ authSetting }) {
        const record = authSetting[RECORDER_AUTH_NAME];
        if (record === true) return cb && nextTick(cb);
        if (record === false) return;

        authorize({
          scope: RECORDER_AUTH_NAME,
          success() {
            showToast({ title: '授权成功', mask: true });
          },
          fail() {
            showToast({ title: '请授权录音功能以发送语音', icon: 'none' });
          },
        });
      },
      fail() {
        showModal({
          title: MESSAGE.SYSTEM_PROMPT,
          content: '录音授权失败,请重试',
          confirmText: MESSAGE.GOT_IT,
          showCancel: false,
        });
      },
    });

  const onTouchStart = () => {
    if (speaking) return;
    checkRecorderAuthorize(handleRecorder);
  };

  const onTouchCancel = () => {
    if (!recorder.current) {
      setSpeaking(false);
      return;
    }

    if (speaking) {
      hideToast();
      setSpeaking(false);
      recorder.current.stop();
    }
  };

  return (
    <>
      <View
        className={classnames(s.speak, { [s.speaking]: speaking })}
        onLongPress={onTouchStart}
        onTouchEnd={onTouchCancel}
        onTouchCancel={onTouchCancel}
      >
        {speaking ? '松开 结束' : '按住 说话'}
      </View>
      {recordAuthorize === false && (
        <View className={s.speak} style={{ zIndex: 10 }} onTap={onClickRecorderAuthorize}>
          点击授权麦克风
        </View>
      )}
    </>
  );
});

const ChatingMessageBar: React.FC = React.memo(() => {
  const setFocus = useSetRecoilState(focusState);
  const [messagebar, setMessagebar] = useRecoilState(messagebarState);
  const [toolbar, setToolbar] = useRecoilState(toolbarState);

  const isKeyboard = messagebar === CHATING_MESSAGEBAR.KEYBOARD;
  const isVoice = messagebar === CHATING_MESSAGEBAR.VOICE;

  const onClickMessagebarMode = () => {
    toolbar !== CHATING_TOOLBAR.HIDDEN && setToolbar(CHATING_TOOLBAR.HIDDEN);
    isVoice && setFocus(true);
    setMessagebar(isVoice ? CHATING_MESSAGEBAR.KEYBOARD : CHATING_MESSAGEBAR.VOICE);
  };

  const onClickToolbarMode = (value: CHATING_TOOLBAR) => {
    const next = value === toolbar ? CHATING_TOOLBAR.HIDDEN : value;

    if (value === CHATING_TOOLBAR.EMOJI && isVoice) {
      setMessagebar(CHATING_MESSAGEBAR.KEYBOARD);
    }

    setToolbar(next);
  };

  return (
    <View className={s.messagebar}>
      <View
        onClick={onClickMessagebarMode}
        className={classnames(s.icon, {
          [s.keyboard]: isVoice,
          [s.voice]: isKeyboard,
        })}
        hoverClassName='clickable-opacity'
        hoverStayTime={0}
      />
      <View
        className={classnames(s.mode, {
          [s.keyboardMode]: isKeyboard,
          [s.speakMode]: isVoice,
        })}
      >
        <InputBar />
        <SpeakBar />
      </View>
      <View
        onClick={() => onClickToolbarMode(CHATING_TOOLBAR.EMOJI)}
        className={classnames(s.icon, s.emoji, { [s.keyboard]: toolbar === CHATING_TOOLBAR.EMOJI })}
        hoverClassName='clickable-opacity'
        hoverStayTime={0}
      />
      <View
        onClick={() => onClickToolbarMode(CHATING_TOOLBAR.MEDIA)}
        className={classnames(s.icon, s.plus)}
        hoverClassName='clickable-opacity'
        hoverStayTime={0}
      />
    </View>
  );
});

export default ChatingMessageBar;
