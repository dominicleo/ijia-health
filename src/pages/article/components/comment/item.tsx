import { Comment } from '@/services/comment/index.types';
import * as React from 'react';
import { View, Image, TouchEvent } from 'remax/wechat';
import classnames from 'classnames';
import s from './item.less';
import Skeleton from '@vant/weapp/lib/skeleton';

const ArticleCommentItemLoader: React.FC<{ size?: number }> = ({ size }) => {
  const Item = () => (
    <View className={classnames(s.comment, s.loader)}>
      <Skeleton avatar loading />
      <View className={s.details}>
        <Skeleton row={4} rowWidth={['35%', '75%', '100%', '20%']} loading />
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

ArticleCommentItemLoader.defaultProps = {
  size: 1,
};

interface ArticleCommentItemPros extends Omit<Comment, 'id'> {
  onLongPress?: (event: TouchEvent) => void;
}

const ArticleCommentItem: React.FC<ArticleCommentItemPros> & {
  Loader: typeof ArticleCommentItemLoader;
} = ({ name, avatar, content, date, onLongPress }) => {
  return (
    <View
      className={s.comment}
      hoverClassName='clickable'
      hoverStayTime={0}
      hoverStopPropagation
      onLongPress={onLongPress}
    >
      <Image className={s.avatar} src={avatar} lazyLoad />
      <View className={s.details}>
        <View className={s.name}>{name}</View>
        <View className={s.content}>{content}</View>
        <View className={s.date}>{date}</View>
      </View>
    </View>
  );
};

ArticleCommentItem.Loader = ArticleCommentItemLoader;

export default ArticleCommentItem;
