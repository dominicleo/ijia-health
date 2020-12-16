import * as React from 'react';
import { View } from 'remax/wechat';
import classnames from 'classnames';
import './index.less';
import PopoverItem from './item';

interface PopoverProps {
  className?: string;
  visible?: boolean;
  placement?:
    | 'left'
    | 'right'
    | 'top'
    | 'bottom'
    | 'topLeft'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomRight';
  mask?: boolean;
  overlay: React.ReactNode;
  onClickMask?: () => void;
}

const prefixCls = 'rm-popover';

const Popover: React.FC<PopoverProps> & { Item: typeof PopoverItem } = ({
  className,
  mask,
  visible,
  overlay,
  placement,
  onClickMask,
  children,
}) => {
  const handleClickMask = () => {
    if (onClickMask && typeof onClickMask === 'function') {
      onClickMask();
    }
  };

  return (
    <View className={classnames(prefixCls, { [`${className}`]: !!className })}>
      {children}
      {visible && (
        <View className={`${prefixCls}-container`}>
          {mask && <View className={`${prefixCls}-mask`} onClick={handleClickMask} />}
          <View
            className={`${prefixCls}-content ${prefixCls}-placement-${placement} border-${!mask}`}
          >
            <View className={`${prefixCls}-arrow`} />
            <View className={`${prefixCls}-inner `}>{overlay}</View>
          </View>
        </View>
      )}
    </View>
  );
};

Popover.defaultProps = {
  placement: 'bottomRight',
};

Popover.Item = PopoverItem;

export default Popover;
