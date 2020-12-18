import './index.less';

import classnames from 'classnames';
import * as React from 'react';
import { usePageEvent } from 'remax/macro';
import {
  Button,
  hideLoading,
  Image,
  showLoading,
  showToast,
  Text,
  TouchEvent,
  View,
} from 'remax/wechat';

import { STORAGE } from '@/constants';
import { useRequest, useStorageState, useUpdateEffect } from '@/hooks';
import useSetState from '@/hooks/useSetState';
import { ArticleService } from '@/services';
import { ARTICLE_TYPE, ArticleId } from '@/services/article/index.types.d';
import { getCurrentPage, isArray, isFunction } from '@/utils';

import ArticleItemLoader from './loader';

interface ArticleItemProps {
  prefixCls?: string;
  /** 根节点样式 */
  className?: string;
  /** 根节点样式 */
  style?: React.CSSProperties;
  /** 文章 ID */
  id: ArticleId;
  /** 文章类型 */
  type?: ARTICLE_TYPE;
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

const ARTICLE_TYPE_TEXT = {
  [ARTICLE_TYPE.COMMON]: '文章',
  [ARTICLE_TYPE.PAPER]: '论文',
};

const ArticleItem: React.FC<ArticleItemProps> & {
  Loader: typeof ArticleItemLoader;
} = (props) => {
  const {
    prefixCls,
    style,
    className,
    id,
    type,
    title,
    picture,
    label,
    date,
    description,
    like,
    likes = 0,
    shares = 0,
    onClick,
  } = props;

  const [state, setState] = useSetState({
    like,
    likes,
    shares,
  });

  const [, updateLikesCache, getLikesCache] = useStorageState<number | undefined>(
    STORAGE.ARTICLE_LIKE_CACHE_PREFIX + id,
  );
  const [, updateSharesCache, getSharesCache] = useStorageState<number | undefined>(
    STORAGE.ARTICLE_SHARE_CACHE_PREFIX + id,
  );

  usePageEvent('onShow', () => {
    const page = getCurrentPage();
    if (!page.__displayReporter.showReferpagepath) return;
    const likesCache = getLikesCache();
    const sharesCache = getSharesCache();
    if (likesCache) {
      setState({ like: true, likes: likesCache });
      updateLikesCache(undefined);
    }
    if (sharesCache) {
      setState({ shares: sharesCache });
      updateSharesCache(undefined);
    }
  });

  useUpdateEffect(() => {
    updateLikesCache(state.likes);
  }, [state.likes]);

  useUpdateEffect(() => {
    updateSharesCache(state.shares);
  }, [state.shares]);

  // 点赞
  const { run: handleLike, loading: likeLoading } = useRequest(ArticleService.like, {
    manual: true,
  });

  // 分享
  const { run: handleShare, loading: shareLoading } = useRequest(ArticleService.share, {
    manual: true,
  });

  const cls = classnames(prefixCls, { [`${className}`]: !!className });

  const onLike = async (event: TouchEvent) => {
    // @ts-ignore
    event.stopPropagation();

    if (!id || likeLoading) return;
    if (state.like) {
      showToast({ icon: 'none', title: '已点赞', mask: true });
      return;
    }
    showLoading({ title: '', mask: true });
    await handleLike(id).finally(() => {
      hideLoading();
    });
    setState({
      like: !state.like,
      likes: state.like ? state.likes - 1 : state.likes + 1,
    });
  };

  const onShare = async (event: TouchEvent) => {
    // @ts-ignore
    event.stopPropagation();

    if (!id || shareLoading) return;
    await handleShare(id);
    setState({
      shares: state.shares + 1,
    });
  };

  return (
    <View
      className={cls}
      style={style}
      onClick={onClick}
      hoverClassName={isFunction(onClick) ? 'clickable' : 'none'}
      hoverStayTime={0}
    >
      <View className={`${prefixCls}-content`}>
        <View className={`${prefixCls}-left`}>
          <View className={`${prefixCls}-title`}>{title}</View>
          <View className={`${prefixCls}-brief`}>
            <View
              className={classnames(`${prefixCls}-label`, {
                [`${prefixCls}-type-article`]: type === ARTICLE_TYPE.COMMON,
                [`${prefixCls}-type-thesis`]: type === ARTICLE_TYPE.PAPER,
              })}
            >
              {type ? ARTICLE_TYPE_TEXT[type] : label}
            </View>
            {date && <View className={`${prefixCls}-date`}>{date}</View>}
          </View>
        </View>
        {picture && <Image className={`${prefixCls}-picture`} src={picture} lazyLoad />}
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
              [`${prefixCls}-like-active`]: state.like,
            })}
            onClick={onLike}
            hoverStopPropagation
          >
            {state.likes}
          </View>
          <View
            className={`${prefixCls}-total ${prefixCls}-share`}
            onClick={onShare}
            hoverStopPropagation
          >
            {state.shares}
            <Button openType='share' data-title={title} data-picture={picture} />
          </View>
        </View>
      </View>
    </View>
  );
};

ArticleItem.defaultProps = {
  prefixCls: 'article-item',
};

ArticleItem.Loader = ArticleItemLoader;

export default ArticleItem;
