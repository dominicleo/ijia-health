import './index.less';

import classnames from 'classnames';
import React from 'react';
import { Image, Text, TouchEvent, View } from 'remax/wechat';

import { isFunction } from '@/hooks/utils';
import { Doctor } from '@/services/doctor/index.types';

import DoctorItemLoader from './loader';

interface DoctorItem
  extends Pick<Doctor, 'name' | 'avatar' | 'officer' | 'hospitalName' | 'departmentName'> {
  prefixCls?: string;
  className?: string;
  style?: React.CSSProperties;
  extra?: React.ReactNode;
  /** (default: true) 显示头像 */
  showAvatar?: boolean;
  /** 点击时触发 */
  onClick?: (event: TouchEvent) => void;
}

const DoctorItem: React.FC<DoctorItem> & { Loader: typeof DoctorItemLoader } = ({
  prefixCls,
  className,
  style,
  name,
  officer,
  avatar,
  hospitalName,
  departmentName,
  extra,
  showAvatar,
  onClick,
}) => {
  const cls = classnames(prefixCls, { [`${className}`]: !!className });
  return (
    <View
      className={cls}
      style={style}
      onClick={onClick}
      hoverClassName={isFunction(onClick) ? 'clickable' : 'none'}
      hoverStayTime={0}
    >
      {showAvatar && (
        <Image className={`${prefixCls}-avatar`} src={avatar} mode='aspectFill' lazyLoad />
      )}
      <View className={`${prefixCls}-left`}>
        <View className={`${prefixCls}-title`}>
          <View className={`${prefixCls}-name`}>{name}</View>
          <View className={`${prefixCls}-officer`}>{officer}</View>
        </View>
        <View className={`${prefixCls}-brief`}>
          {[departmentName, hospitalName].filter(Boolean).map((text, index) => (
            <Text key={index}>{text}</Text>
          ))}
        </View>
      </View>
      {extra && <View className={`${prefixCls}-extra`}>{extra}</View>}
    </View>
  );
};

DoctorItem.defaultProps = {
  prefixCls: 'doctor-item',
  showAvatar: true,
};

DoctorItem.Loader = DoctorItemLoader;

export default DoctorItem;
