import * as React from 'react';
import { View } from 'remax/wechat';

import s from './index.less';

interface MessageSessionProps {
  visbile?: boolean;
}

const MessageSession: React.FC<MessageSessionProps> = () => {
  return <View className={s.wrapper}>example</View>;
};

export default MessageSession;
