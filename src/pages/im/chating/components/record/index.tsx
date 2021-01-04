import { useUpdateEffect } from '@/hooks';
import { last } from '@/utils';
import { NimRecord } from '@/utils/im';
import isEqual from 'lodash.isequal';
import * as React from 'react';
import { nextTick, View, ScrollView } from 'remax/wechat';
import s from './index.less';
import ChatingRecordItem from './item';

interface ChatingRecordProps {
  messages: NimRecord[];
}

const ChatingRecord: React.FC<ChatingRecordProps> = React.memo(({ messages }) => {
  const [scrollIntoView, setScrollIntoView] = React.useState('');

  useUpdateEffect(() => {
    const lastMessage = last(messages);
    lastMessage && nextTick(() => setScrollIntoView(`record_${lastMessage.idClient}`));
  }, [messages]);

  console.log(messages);

  return (
    <ScrollView className={s.wrapper} scrollIntoView={scrollIntoView} scrollWithAnimation scrollY>
      <View className={s.content}>
        {messages.map((message) => (
          <ChatingRecordItem key={message.idClient} {...message} />
        ))}
      </View>
    </ScrollView>
  );
}, isEqual);

export default ChatingRecord;
