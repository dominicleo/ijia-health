import * as React from 'react';
import { Image, ScrollView, View } from 'remax/wechat';

import SafeArea from '@/components/safe-area';

import ChatingContext from '../context';
import { CHATING_ACTION_TYPE, MESSAGEBAR_ACTION_TYPE } from '../types.d';
import EMOJI_CONFIG from './data';
import s from './index.less';

const ChatingEmoji: React.FC = () => {
  const { chating$ } = React.useContext(ChatingContext);
  return (
    <ScrollView className={s.wrapper} scrollY>
      <View className={s.items}>
        {EMOJI_CONFIG.items.map((item) => (
          <View
            key={item.name}
            className={s.item}
            onClick={() =>
              chating$?.emit({
                type: CHATING_ACTION_TYPE.SEND,
                payload: { type: MESSAGEBAR_ACTION_TYPE.EMOJI, payload: item },
              })
            }
            hoverClassName='clickable-opacity'
            hoverStayTime={0}
          >
            <Image src={item.url} lazyLoad />
          </View>
        ))}
      </View>
      <SafeArea />
    </ScrollView>
  );
};

export default ChatingEmoji;
