import './index.less';

import * as React from 'react';
import { View } from 'remax/wechat';

interface SafeAreaProps {
  /** 位置 */
  position?: 'top' | 'right' | 'bottom' | 'left';
}

const SafeArea: React.FC<SafeAreaProps> = ({ position }) => {
  const prefixCls = 'safe-area';
  return <View className={`${prefixCls} ${prefixCls}-${position}`} />;
};

SafeArea.defaultProps = {
  position: 'bottom',
};

export default SafeArea;
