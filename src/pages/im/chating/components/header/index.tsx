import * as React from 'react';
import { TouchEvent, View } from 'remax/wechat';
import Navbar from '@vant/weapp/lib/nav-bar';

import s from './index.less';
import Loading from '@vant/weapp/lib/loading';

interface ChatingHeaderProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  onBack?: (event: TouchEvent) => void;
}

const ChatingHeader: React.FC<ChatingHeaderProps> = ({ title, subtitle, loading, onBack }) => {
  return (
    <View className={s.navbar}>
      <Navbar border={false}>
        <View slot='left'>
          <View className={s.back} onClick={onBack} />
        </View>
        <View slot='title' className={s.header}>
          {loading ? (
            <Loading type='spinner' size={20} />
          ) : (
            <>
              <View className={s.title}>{title}</View>
              {subtitle && <View className={s.subtitle}>{subtitle}</View>}
            </>
          )}
        </View>
      </Navbar>
    </View>
  );
};

export default ChatingHeader;
