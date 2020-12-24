import * as React from 'react';
import { View } from 'remax/wechat';
import ChatingContext from '../context';
import { MESSAGEBAR_ACTION_TYPE } from '../types.d';
import s from './index.less';

const ChatingContainer: React.FC = React.memo(({ children }) => {
  const { messagebar$ } = React.useContext(ChatingContext);
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);
  const content = React.useMemo(() => children, []);

  messagebar$?.useSubscription((action) => {
    if (action.type === MESSAGEBAR_ACTION_TYPE.KEYBOARDHEIGHTCHANGE) {
      setKeyboardHeight(action.payload);
    }
  });

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
