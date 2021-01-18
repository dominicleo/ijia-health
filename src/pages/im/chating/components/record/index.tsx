import isEqual from 'lodash.isequal';
import * as React from 'react';
import { ScrollView, View } from 'remax/wechat';

import { useUpdateEffect } from '@/hooks';
import { NIM_MESSAGE_TYPE, NimRecord } from '@/utils/im';

import ChatingContext from '../context';
import { CHATING_ACTION_TYPE } from '../types.d';
import s from './index.less';
import ChatingRecordItem from './item';

interface ChatingRecordProps {
  messages: NimRecord[];
}

const isPreviewRecord = ({ type }: NimRecord) =>
  type === NIM_MESSAGE_TYPE.IMAGE || type === NIM_MESSAGE_TYPE.VIDEO;

const ChatingRecord: React.FC<ChatingRecordProps> = React.memo(({ messages }) => {
  const { chating$ } = React.useContext(ChatingContext);
  const [scrollIntoView, setScrollIntoView] = React.useState('');
  const id = `record_bottom_${messages.length}`;

  chating$?.useSubscription((action) => {
    if (action.type !== CHATING_ACTION_TYPE.PREVIEW) return;
    const { idClient } = action.payload;
    let current = 0;
    const sources = messages.filter(isPreviewRecord).map((message, index) => {
      message.idClient === idClient && (current = index);
      return { url: message.file?.url, type: message.type };
    });

    wx.previewMedia({ sources, current }, true);
  });

  const scrollBottom = () => setScrollIntoView(id);

  React.useEffect(scrollBottom);
  useUpdateEffect(scrollBottom, [messages]);

  return (
    <ScrollView className={s.wrapper} scrollIntoView={scrollIntoView} scrollWithAnimation scrollY>
      {messages.map((message) => (
        <ChatingRecordItem key={message.idClient} {...message} />
      ))}
      <View id={id} className={s.bottom} />
    </ScrollView>
  );
}, isEqual);

export default ChatingRecord;
