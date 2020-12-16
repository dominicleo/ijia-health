import { Doctor } from '@/services/doctor/index.types';
import * as React from 'react';
import { View } from 'remax/wechat';

import './index.less';

const ArticleDoctor: React.FC<{
  data: Pick<Doctor, 'avatar' | 'name' | 'hospitalName'>;
}> = React.memo(({ data }) => {
  const avatarStyle: React.CSSProperties = data.avatar
    ? { backgroundImage: `url(${data.avatar})` }
    : {};
  return (
    <View className='doctor'>
      <View className='doctor-avatar' style={avatarStyle} />
      <View>
        <View className='doctor-title'>{data.name}</View>
        <View className='doctor-brief'>{data.hospitalName}</View>
      </View>
    </View>
  );
});

export default ArticleDoctor;
