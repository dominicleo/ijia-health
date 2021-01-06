import classnames from 'classnames';
import * as React from 'react';
import { Image, View } from 'remax/wechat';

import { NIM_MESSAGE_FLOW, NimRecord } from '@/utils/im';

import s from './index.less';

interface ChatingRecordWrapperOptions<T> {
  header?: React.FunctionComponent<T>;
  children?: React.FunctionComponent<T>;
}

function ChatingRecordWrapper<T extends NimRecord>(options: ChatingRecordWrapperOptions<T>) {
  const { header, children } = options;
  return (props: T) => {
    const { idClient, flow, user, displayTime } = props;
    const isSent = flow === NIM_MESSAGE_FLOW.OUT;
    return (
      <View
        id={`record_${idClient}`}
        className={classnames(s.record, {
          [s.received]: !isSent,
          [s.sent]: isSent,
        })}
      >
        {header ? (
          <View className={s.header}>{React.createElement(header, props)}</View>
        ) : (
          <View className={s.header}>
            {displayTime && <View className={s.date}>{displayTime}</View>}
          </View>
        )}
        {children && (
          <View className={s.body}>
            <Image className={s.avatar} src={user?.avatar} lazyLoad />
            <View className={s.content}>{React.createElement(children, props)}</View>
          </View>
        )}
      </View>
    );
  };
}

export default ChatingRecordWrapper;
