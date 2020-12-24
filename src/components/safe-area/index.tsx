import './index.less';

import * as React from 'react';
import { View } from 'remax/wechat';
import classnames from 'classnames';

interface SafeAreaProps {
  /** 根节点样式 */
  className?: string;
  /** 位置 */
  position?: 'top' | 'right' | 'bottom' | 'left';
}

const SafeArea: React.FC<SafeAreaProps> = ({ className, position }) => {
  const prefixCls = 'safe-area';
  const cls = classnames(prefixCls, `${prefixCls}-${position}`, { [`${className}`]: !!className });
  return <View className={cls} />;
};

SafeArea.defaultProps = {
  position: 'bottom',
};

export default SafeArea;
