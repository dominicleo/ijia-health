import * as React from 'react';
import { Input, View } from 'remax/wechat';
import s from './index.less';
import classnames from 'classnames';
import { useToggle } from '@/hooks';
import ChatingContext from '../context';
import { MESSAGEBAR_MODE, MESSAGEBAR_ACTION_TYPE, CHATING_TOOLBAR_MODE } from '../types.d';

const InputBar = React.memo(() => {
  const [value, setValue] = React.useState('');
  const { messagebar$ } = React.useContext(ChatingContext);

  return (
    <Input
      value={value}
      className={s.input}
      placeholderClassName={s.placeholder}
      placeholder='请仔细描述你的问题'
      onFocus={() => messagebar$?.emit({ type: MESSAGEBAR_ACTION_TYPE.FOCUS })}
      onBlur={() => messagebar$?.emit({ type: MESSAGEBAR_ACTION_TYPE.BLUR })}
      onInput={(event) => setValue(event.detail.value)}
      onKeyboardHeightChange={(event) =>
        messagebar$?.emit({
          type: MESSAGEBAR_ACTION_TYPE.KEYBOARDHEIGHTCHANGE,
          payload: event.detail.height,
        })
      }
      adjustPosition={false}
      confirmType='send'
      confirmHold
    />
  );
});

const ChatingMessageBar: React.FC = React.memo(() => {
  const { messagebar$ } = React.useContext(ChatingContext);
  const [mode, { toggle: toogleMode }] = useToggle(MESSAGEBAR_MODE.KEYBOARD, MESSAGEBAR_MODE.VOICE);

  return (
    <View className={s.messagebar}>
      <View
        onClick={() => toogleMode()}
        className={classnames(s.icon, {
          [s.keyboard]: mode === MESSAGEBAR_MODE.VOICE,
          [s.voice]: mode === MESSAGEBAR_MODE.KEYBOARD,
        })}
        hoverClassName='clickable-opacity'
        hoverStayTime={0}
      />
      <InputBar />
      <View
        onClick={() =>
          messagebar$?.emit({
            type: MESSAGEBAR_ACTION_TYPE.TOOLBAR,
            payload: CHATING_TOOLBAR_MODE.EMOJI,
          })
        }
        className={classnames(s.icon, s.emoji)}
        hoverClassName='clickable-opacity'
        hoverStayTime={0}
      />
      <View
        onClick={() =>
          messagebar$?.emit({
            type: MESSAGEBAR_ACTION_TYPE.TOOLBAR,
            payload: CHATING_TOOLBAR_MODE.MEDIA,
          })
        }
        className={classnames(s.icon, s.plus)}
        hoverClassName='clickable-opacity'
        hoverStayTime={0}
      />
    </View>
  );
});

export default ChatingMessageBar;
