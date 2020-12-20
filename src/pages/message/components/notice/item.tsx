import * as React from 'react';
import { Message, MESSAGE_LINK_TYPE } from '@/services/message/index.types.d';
import { View } from 'remax/wechat';
import classnames from 'classnames';

import s from './item.less';
import history from '@/utils/history';
import PAGE from '@/constants/page';
import Skeleton from '@vant/weapp/lib/skeleton';

const NoticeItemLoader: React.FC<{ size?: number }> = ({ size }) => {
  const Item = () => (
    <View className={classnames(s.notice, s.loader)}>
      <View className={s.date}>
        <Skeleton title loading />
      </View>
      <View className={s.card}>
        <Skeleton title titleWidth='25%' row={2} rowWidth={['100%', '75%']} loading />
      </View>
      <View className={s.footbar} />
    </View>
  );

  return (
    <>
      {size && size > 1 ? (
        Array.from(Array(size).keys()).map((_, index) => <Item key={index} />)
      ) : (
        <Item />
      )}
    </>
  );
};

NoticeItemLoader.defaultProps = {
  size: 1,
};

const NoticeItem: React.FC<Message> & { Loader: typeof NoticeItemLoader } = ({
  title,
  content,
  date,
  params,
}) => {
  const onClick = React.useCallback(() => {
    switch (params.targetPageCode) {
      case MESSAGE_LINK_TYPE.IM:
        return;
      default:
        history.push(PAGE.ARCHIVES);
    }
  }, [params]);

  return (
    <View className={s.notice} onClick={onClick}>
      <View className={s.date}>{date}</View>
      <View className={s.card} hoverClassName='clickable' hoverStayTime={0}>
        <View className={s.title}>{title}</View>
        <View className={s.content}>{content}</View>
      </View>
      <View className={s.footbar}>查看详情</View>
    </View>
  );
};

NoticeItem.Loader = NoticeItemLoader;

export default NoticeItem;
