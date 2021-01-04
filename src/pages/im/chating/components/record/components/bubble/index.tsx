import './index.less';

import classnames from 'classnames';
import * as React from 'react';
import { View, ViewProps } from 'remax/wechat';

const ChatingRecordBubble: React.FC<ViewProps> = React.memo(({ className, children, ...rest }) => {
  return (
    <View className={classnames('bubble', { [`${className}`]: !!className })} {...rest}>
      {children}
    </View>
  );
});

export default ChatingRecordBubble;
