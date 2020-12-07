import './index.less';

import classnames from 'classnames';
import * as React from 'react';
import { Button, hideLoading, showLoading, showToast, Text, TouchEvent, View } from 'remax/wechat';

import { useRequest } from '@/hooks';
import useSetState from '@/hooks/useSetState';
import { ArticleService } from '@/services';
import { isArray, isFunction } from '@/utils';

interface ArticleItemProps {
  prefixCls?: string;
  /** 文章 ID */
  id: number;
  /** 文章标题 */
  title: string;
  /** 文章封面 */
  picture?: string;
  /** 分类 */
  label?: React.ReactNode;
  /** 发布时间 */
  date?: string;
  /** 文章描述 */
  description?: React.ReactNode;
  /** 点赞状态 */
  like?: boolean;
  /** 点赞数量 */
  likes?: number;
  /** 分享数量 */
  shares?: number;
  /** 点击时触发 */
  onClick?: (event: TouchEvent) => void;
}

const ArticleItem: React.FC<ArticleItemProps> = (props) => {
  const {
    prefixCls,
    id,
    title,
    picture,
    label,
    date,
    description,
    like,
    likes,
    shares,
    onClick,
  } = props;

  const [state, setState] = useSetState({
    like,
    likes,
    shares,
  });

  const { run: handleLike, loading: likeLoading } = useRequest(ArticleService.like, {
    manual: true,
  });

  const cls = classnames(prefixCls);

  const onLike = (event: TouchEvent) => {
    // @ts-ignore
    event.stopPropagation();

    if (likeLoading) return;
    showLoading({ title: '', mask: true });
    handleLike(id).finally(() => {
      hideLoading();
    });
  };

  const onShare = (event: TouchEvent) => {
    // @ts-ignore
    event.stopPropagation();
  };

  return (
    <View
      className={cls}
      onClick={onClick}
      hoverClassName={isFunction(onClick) ? 'clickable' : 'none'}
      hoverStayTime={0}
    >
      <View className={`${prefixCls}-content`}>
        <View>
          <View className={`${prefixCls}-title`}>{title}</View>
          <View className={`${prefixCls}-brief`}>
            <Text className={`${prefixCls}-label`}>{label}</Text>
            {date && <Text className={`${prefixCls}-date`}>{date}</Text>}
          </View>
        </View>
        {picture && (
          <View className={`${prefixCls}-picture`} style={{ backgroundImage: `url(${picture})` }} />
        )}
      </View>
      <View className={`${prefixCls}-footer`}>
        <View className={`${prefixCls}-description`}>
          {isArray(description) ? (
            description
              .filter(Boolean)
              .map((node, index) => <Text key={`description_node_${index}`}>{node}</Text>)
          ) : (
            <Text>{description}</Text>
          )}
        </View>
        <View className={`${prefixCls}-totals`}>
          <View
            className={classnames(`${prefixCls}-total ${prefixCls}-like`, {
              [`${prefixCls}-like-active`]: like,
            })}
            onClick={onLike}
            hoverStopPropagation
          >
            {likes}
          </View>
          <View
            className={`${prefixCls}-total ${prefixCls}-share`}
            onClick={onShare}
            hoverStopPropagation
          >
            {shares}
            <Button openType='share' data-title={title} data-picture={picture} />
          </View>
        </View>
      </View>
    </View>
  );
};

ArticleItem.defaultProps = {
  prefixCls: 'article-item',
  likes: 0,
  shares: 0,
};

export default ArticleItem;
