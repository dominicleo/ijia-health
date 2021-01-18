import classnames from 'classnames';
import * as React from 'react';
import { Text, View } from 'remax/wechat';

import SafeArea from '@/components/safe-area';

import ChatingContext from '../context';
import { CHATING_ACTION_TYPE, CHATING_MEDIA_TYPE } from '../types.d';
import s from './index.less';

const MEDIA_ITEMS: Array<{ value: CHATING_MEDIA_TYPE; label: string }> = [
  {
    value: CHATING_MEDIA_TYPE.ALBUM,
    label: '相册',
  },
  {
    value: CHATING_MEDIA_TYPE.CAMERA,
    label: '拍摄',
  },
  {
    value: CHATING_MEDIA_TYPE.VIDEO,
    label: '视频',
  },
  {
    value: CHATING_MEDIA_TYPE.AUDIO,
    label: '语音',
  },
];

const ChatingMedia: React.FC = () => {
  const { chating$ } = React.useContext(ChatingContext);
  return (
    <View className={s.wrapper}>
      <View className={s.items}>
        {MEDIA_ITEMS.map(({ value, label }) => (
          <View
            key={value}
            className={s.item}
            onClick={() => chating$?.emit({ type: CHATING_ACTION_TYPE.MEDIA, payload: value })}
            hoverClassName='clickable-opacity'
            hoverStayTime={0}
          >
            <View className={classnames(s.icon, s[value])} />
            <Text>{label}</Text>
          </View>
        ))}
      </View>
      <SafeArea />
    </View>
  );
};

export default ChatingMedia;
