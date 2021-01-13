import './index.less';

import classnames from 'classnames';
import React from 'react';
import { View } from 'remax/wechat';

import { GETTING_DATA, NO_MORE } from '@/constants/message';
import Loading from '@vant/weapp/lib/loading';

interface LoadableProps {
  className?: string;
  loading?: boolean;
}

const Loadable: React.FC<LoadableProps> = ({ className, loading }) => {
  return (
    <View className={classnames('loadable', { [`${className}`]: !!className })}>
      {!loading ? (
        <>{NO_MORE}</>
      ) : (
        <Loading type='circular' size={14}>
          {GETTING_DATA}
        </Loading>
      )}
    </View>
  );
};

export default Loadable;
