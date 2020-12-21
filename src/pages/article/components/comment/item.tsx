import { Comment } from '@/services/comment/index.types';
import * as React from 'react';
import { View, Text, Image, TouchEvent, nextTick, createSelectorQuery } from 'remax/wechat';
import classnames from 'classnames';
import s from './item.less';
import Skeleton from '@vant/weapp/lib/skeleton';
import useSetState from '@/hooks/useSetState';
import Ellipsis from '@/components/ellipsis';
import { isArray } from '@/utils';

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

interface ArticleCommentItemPros extends Comment {
  onLongPress?: (event: TouchEvent) => void;
}

const ArticleCommentItem: React.FC<ArticleCommentItemPros> & {
  Loader: typeof ArticleCommentItemLoader;
} = ({ id, name, avatar, content, date, onLongPress }) => {
  const idPrefix = React.useRef(Math.random().toString(36).slice(-8));
  const CONTENT_ELEMENT_ID = `${idPrefix.current}_content_${id}`;
  const CONTRAST_ELEMENT_ID = `${idPrefix.current}_contrast_${id}`;
  const [state, setState] = useSetState({ expanded: false, isEllipsis: false });

  const measure = () => {
    const query = createSelectorQuery();
    query.selectAll(`#${CONTENT_ELEMENT_ID}, #${CONTRAST_ELEMENT_ID}`).boundingClientRect();
    query.exec((response) => {
      const [elements] = response;
      if (!(isArray(elements) && elements.length === 2)) return;
      const [commentElement, contrastElement] = elements;
      Math.floor(commentElement.height) > Math.floor(contrastElement.height) &&
        setState({ isEllipsis: true });
    });
  };

  React.useEffect(() => nextTick(measure), [content]);

  const onExpand = React.useCallback(() => {
    if (!state.isEllipsis || state.expanded) return;
    setState({ expanded: true });
  }, [state]);

  return (
    <View
      className={s.comment}
      hoverClassName='clickable'
      hoverStayTime={0}
      hoverStopPropagation
      onLongPress={onLongPress}
    >
      <Image className={s.avatar} src={avatar} lazyLoad />
      <View className={s.details} onClick={onExpand}>
        <View className={s.name}>{name}</View>
        <Ellipsis
          id={CONTENT_ELEMENT_ID}
          rows={state.isEllipsis && !state.expanded ? 5 : 0}
          className={s.content}
        >
          {content}
        </Ellipsis>
        <Ellipsis id={CONTRAST_ELEMENT_ID} rows={5} className={classnames(s.content, s.contrast)}>
          {content}
        </Ellipsis>
        <View className={s.date}>
          {date}
          {state.isEllipsis && !state.expanded && <Text className={s.expand}>展开</Text>}
        </View>
      </View>
    </View>
  );
};

ArticleCommentItem.Loader = ArticleCommentItemLoader;

export default ArticleCommentItem;
