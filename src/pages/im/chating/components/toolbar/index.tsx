import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { View } from 'remax/wechat';

import SafeArea from '@/components/safe-area';

import { keyboardHeightState, toolbarState } from '../atoms';
import ChatingEmoji from '../emoji';
import ChatingMedia from '../media';
import ChatingMessageBar from '../messagebar';
import { CHATING_TOOLBAR } from '../types.d';
import s from './index.less';

const ChatingToolbar: React.FC = React.memo(() => {
  const keyboardHeight = useRecoilValue(keyboardHeightState);
  const toolbar = useRecoilValue(toolbarState);

  return (
    <View className={s.toolbar}>
      <View className={s.inner}>
        <ChatingMessageBar />
      </View>
      <View className={s.footer}>
        {toolbar === CHATING_TOOLBAR.EMOJI && <ChatingEmoji />}
        {toolbar === CHATING_TOOLBAR.MEDIA && <ChatingMedia />}
      </View>
      {!keyboardHeight && toolbar === CHATING_TOOLBAR.HIDDEN && <SafeArea className={s.safearea} />}
    </View>
  );
});

export default ChatingToolbar;
