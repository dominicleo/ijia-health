import * as React from 'react';
import { TouchEvent, View } from 'remax/wechat';
import classnames from 'classnames';
import './item.less';

interface PopoverItemProps {
  className?: string;
  icon?: React.ReactNode;
  onClick?: (event: TouchEvent<Touch>) => any;
}

const prefixCls = 'rm-popover-item';

const PopoverItem: React.FC<PopoverItemProps> = ({ className, icon, onClick, children }) => {
  const handleClick = (event: TouchEvent<Touch>) => {
    if (onClick && typeof onClick === 'function') {
      onClick(event);
    }
  };
  return (
    <View
      className={classnames(prefixCls, { [`${className}`]: !!className })}
      hoverClassName={`${prefixCls}-hover`}
      hoverStartTime={20}
      hoverStayTime={20}
      onClick={handleClick}
    >
      <View className={`${prefixCls}-wrapper`}>
        {icon && <View className={`${prefixCls}-icon-holder ${prefixCls}-ver-center`}>{icon}</View>}
        <View className={`${prefixCls}-slot-holder ${prefixCls}-ver-center`}>{children}</View>
      </View>
    </View>
  );
};

export default PopoverItem;
