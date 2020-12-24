import * as React from 'react';
import { TouchEvent, View, Image } from 'remax/wechat';
import classnames from 'classnames';

import s from './item.less';
import Skeleton from '@vant/weapp/lib/skeleton';
import Ellipsis from '@/components/ellipsis';

const SessionItemLoader: React.FC<{ size?: number }> = ({ size }) => {
  const Item = () => (
    <View className={classnames(s.session, s.loader)}>
      <View className={s.avatar} />
      <View className={s.details}>
        <Skeleton row={2} rowWidth={['25%', '100%']} loading />
      </View>
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

SessionItemLoader.defaultProps = {
  size: 1,
};

interface SessionItemProps {
  unread?: number;
  name: string;
  avatar: string;
  content: string;
  date: string;
  onClick?: (event?: TouchEvent) => void;
}

const SessionItem: React.FC<SessionItemProps> & { Loader: typeof SessionItemLoader } = ({
  name,
  avatar,
  content,
  date,
  onClick,
}) => {
  return (
    <View className={s.session} onClick={onClick} hoverClassName='clickable' hoverStayTime={0}>
      <View className={s.avatar}>
        <Image src={avatar} lazyLoad />
      </View>
      <View className={s.details}>
        <View className={s.name}>
          <Ellipsis rows={1}>{name}</Ellipsis>
          <View className={s.date}>{date}</View>
        </View>
        <Ellipsis className={s.content} rows={1}>
          {content}
        </Ellipsis>
      </View>
    </View>
  );
};

SessionItem.Loader = SessionItemLoader;

export default SessionItem;
