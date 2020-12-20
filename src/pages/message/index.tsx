import * as React from 'react';
import { Swiper, SwiperItem, View } from 'remax/wechat';
import classnames from 'classnames';

import s from './index.less';
import MessageSession from './components/session';
import Empty from '@/components/empty';
import MessageNotice from './components/notice';
import { MESSAGE_TYPE } from '@/services/message/index.types.d';

const TABS = [
  { title: '咨询消息', component: () => <MessageSession /> },
  { title: '服务消息', component: () => <MessageNotice type={MESSAGE_TYPE.SERVICE} /> },
  { title: '系统消息', component: () => <MessageNotice type={MESSAGE_TYPE.SYSTEM} /> },
  { title: '精选活动', component: () => <Empty image='message' /> },
];

export default () => {
  const [active, setActive] = React.useState(0);
  return (
    <View className={s.wrapper}>
      <View className={s.tabs}>
        {TABS.map(({ title }, index) => (
          <View
            key={`TAB_${index}`}
            className={classnames(s.tab, { [s.active]: index === active })}
            onClick={() => setActive(index)}
          >
            <View>{title}</View>
          </View>
        ))}
      </View>
      <Swiper
        className={s.content}
        current={active}
        onChange={({ detail }) => detail.source === 'touch' && setActive(detail.current)}
      >
        {TABS.map(({ component }, index) => (
          <SwiperItem key={`SWIPER_${index}`}>
            {React.cloneElement(component(), { visible: index === active })}
          </SwiperItem>
        ))}
      </Swiper>
    </View>
  );
};
