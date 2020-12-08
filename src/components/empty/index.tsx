import './index.less';

import classnames from 'classnames';
import * as React from 'react';
import { View } from 'remax/wechat';

// const defaultPicture: { [key: string]: any } = {
//   network: getFrontURL('miniprograms/page-network.png'),
//   empty: getFrontURL('miniprograms/page-empty.png'),
//   'empty-message': getFrontURL('miniprograms/page-empty-message.png'),
//   'empty-record': getFrontURL('miniprograms/page-empty-record.png'),
//   'empty-search': getFrontURL('miniprograms/page-empty-search.png'),
//   'empty-scan': getFrontURL('miniprograms/page-empty-scan.png'),
// };

// const defaultMessage: { [key: string]: any } = {
//   network: (
//     <>
//       <View>咦，网络跑丢了</View>
//       <View>请检查网络后重新加载</View>
//     </>
//   ),
//   empty: '未找到您要的内容',
//   'empty-message': '这里空空如也，没有消息',
//   'empty-record': '暂无订单记录',
//   'empty-search': '未找到您要的内容',
//   'empty-scan': '未找到您要的内容',
// };

enum EMPTY_TYPE {
  /** 默认 */
  DEFAULT = 'default',
}

interface EmptyProps {
  prefixCls?: string;
  /** 根节点样式 */
  className?: string;
  /** 类型 */
  type?: string;
  /** 错误栈 */
  error?: any;
}

const Empty: React.FC<EmptyProps> = ({ prefixCls, className }) => {
  return <View className={classnames(prefixCls, { [`${className}`]: !!className })}></View>;
};

Empty.defaultProps = {
  prefixCls: 'ram-empty',
  type: EMPTY_TYPE.DEFAULT,
};

<Empty type='default' />;

export default Empty;
