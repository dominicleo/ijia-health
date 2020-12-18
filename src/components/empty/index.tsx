import './index.less';

import classnames from 'classnames';
import * as React from 'react';
import { View, TouchEvent } from 'remax/wechat';

const PRESETS = new Map<string, string[]>([
  ['default', ['https://m.ijia120.com/miniprograms/page-empty.png', '']],
  ['network', ['https://m.ijia120.com/miniprograms/page-network.png', '请检查网络后重新加载']],
  ['search', ['https://m.ijia120.com/miniprograms/page-empty-search.png', '未找到您要的内容']],
  ['record', ['https://m.ijia120.com/miniprograms/page-empty-record.png', '暂无数据']],
  ['scan', ['https://m.ijia120.com/miniprograms/page-empty-scan.png', '请检查网络后重新加载']],
  [
    'message',
    ['https://m.ijia120.com/miniprograms/page-empty-message.png', '这里空空如也，没有消息'],
  ],
]);

interface EmptyProps {
  prefixCls?: string;
  /** 根节点样式 */
  className?: string;
  /** (default: default) 图片类型 */
  image?: 'default' | 'network' | 'search' | 'record' | 'scan' | 'message' | string;
  /** 图片下方的描述文字 */
  description?: React.ReactNode;
  local?: boolean;
  onClick?: (event: TouchEvent) => void;
}

const Empty: React.FC<EmptyProps> = ({
  prefixCls,
  className,
  local,
  onClick,
  children,
  ...props
}) => {
  const preset = (props.image && PRESETS.get(props.image)) || [];
  const [image, presetDescription] = preset;
  const description = props.description || presetDescription;

  const pictureStyle: React.CSSProperties = image ? { backgroundImage: `url(${image})` } : {};

  return (
    <View
      className={classnames(prefixCls, {
        [`${prefixCls}-local`]: local,
        [`${className}`]: !!className,
      })}
      onClick={onClick}
    >
      <View className={`${prefixCls}-picture`} style={pictureStyle} />
      {!!description && <View className={`${prefixCls}-description`}>{description}</View>}
      {children && <View className={`${prefixCls}-footer`}>{children}</View>}
    </View>
  );
};

Empty.defaultProps = {
  prefixCls: 'rm-empty',
  image: 'default',
};

export default Empty;
