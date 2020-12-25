import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { View } from 'remax/wechat';

import { keyboardHeightState } from '../atoms';
import s from './index.less';

const ChatingContainer: React.FC = React.memo(({ children }) => {
  const keyboardHeight = useRecoilValue(keyboardHeightState);
  const content = React.useMemo(() => children, []);

  const contentStyle: React.CSSProperties = {
    transition: '200ms',
    transform: `translate3d(0, -${keyboardHeight}PX, 0)`,
  };

  return (
    <View className={s.container}>
      <View className={s.content} style={contentStyle}>
        {content}
      </View>
    </View>
  );
});

export default ChatingContainer;
