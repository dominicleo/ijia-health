import './loader.less';

import * as React from 'react';
import { View } from 'remax/wechat';

import Skeleton from '@vant/weapp/lib/skeleton';

export interface DoctorItemLoaderProps {
  prefixCls?: string;
  /** 列表数量 */
  size?: number;
  /** (default: true) 显示头像 */
  showAvatar?: boolean;
}

const DoctorItemLoader: React.FC<DoctorItemLoaderProps> = ({ prefixCls, size, showAvatar }) => {
  const Item = () => (
    <View className={prefixCls}>
      <Skeleton
        avatar={showAvatar}
        avatarShape='round'
        avatarSize='56px'
        row={2}
        rowWidth={['50%', '85%']}
        loading
      />
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

DoctorItemLoader.defaultProps = {
  prefixCls: 'doctor-item-loader',
  size: 1,
  showAvatar: true,
};

export default DoctorItemLoader;
