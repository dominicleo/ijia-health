import SafeArea from '@/components/safe-area';
import * as React from 'react';
import { View } from 'remax/wechat';
import ChatingContext from '../context';
import ChatingMessageBar from '../messagebar';
import { CHATING_TOOLBAR_MODE, MESSAGEBAR_ACTION_TYPE } from '../types.d';
import ChatingEmoji from './emoji';
import s from './index.less';
import ChatingMedia from './media';

const ChatingToolbar: React.FC = React.memo(() => {
  console.log('ChatingToolbar init');

  const { messagebar$ } = React.useContext(ChatingContext);
  const [mode, setMode] = React.useState<CHATING_TOOLBAR_MODE>(CHATING_TOOLBAR_MODE.HIDDEN);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  messagebar$?.useSubscription((action) => {
    if (action.type === MESSAGEBAR_ACTION_TYPE.FOCUS && mode !== CHATING_TOOLBAR_MODE.HIDDEN) {
      setMode(CHATING_TOOLBAR_MODE.HIDDEN);
      return;
    }
    if (action.type === MESSAGEBAR_ACTION_TYPE.TOOLBAR) {
      setMode(action.payload === mode ? CHATING_TOOLBAR_MODE.HIDDEN : action.payload);
      return;
    }
    if (action.type === MESSAGEBAR_ACTION_TYPE.KEYBOARDHEIGHTCHANGE) {
      setKeyboardHeight(action.payload);
      return;
    }
  });

  return (
    <View className={s.toolbar}>
      <View className={s.inner}>
        <ChatingMessageBar />
      </View>
      <View className={s.footer}>
        {mode === CHATING_TOOLBAR_MODE.EMOJI && <ChatingEmoji />}
        {mode === CHATING_TOOLBAR_MODE.MEDIA && <ChatingMedia />}
      </View>
      {(!keyboardHeight || mode === CHATING_TOOLBAR_MODE.HIDDEN) && (
        <SafeArea className={s.safearea} />
      )}
    </View>
  );
});

export default ChatingToolbar;
