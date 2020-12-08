import './loader.less';

import classnames from 'classnames';
import * as React from 'react';
import { View } from 'remax/wechat';

import Skeleton from '@vant/weapp/lib/skeleton';

export interface ArticleItemLoaderProps {
  prefixCls?: string;
  /** 列表数量 */
  size?: number;
}

const ArticleItemLoader: React.FC<ArticleItemLoaderProps> = ({ prefixCls, size }) => {
  const Item = () => (
    <View className={classnames(prefixCls)}>
      <View className={`${prefixCls}-content`}>
        <View className={`${prefixCls}-left`}>
          <View className={`${prefixCls}-title`}>
            <Skeleton title row={1} rowWidth='75%' loading />
          </View>
          <View className={`${prefixCls}-brief`}>
            <Skeleton title titleWidth='50%' loading />
          </View>
        </View>
        <View className={`${prefixCls}-picture`}>
          <Skeleton title loading />
        </View>
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

ArticleItemLoader.defaultProps = {
  prefixCls: 'article-item-loader',
  size: 1,
};

export default ArticleItemLoader;
