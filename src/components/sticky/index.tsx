import useSetState from '@/hooks/useSetState';
import * as React from 'react';
import { createSelectorQuery, View } from 'remax/wechat';

interface StickyProps {
  /** (default: 99) 吸顶时的 z-index */
  zIndex?: number;
  scrollTop?: number;
  offsetTop?: number;
  container?: () => WechatMiniprogram.NodesRef;
  disabled?: boolean;
}

const Sticky: React.FC<StickyProps> = ({
  zIndex,
  scrollTop,
  offsetTop,
  container,
  disabled,
  children,
}) => {
  const [state, setState] = useSetState({ height: 0, fixed: false, transform: 0 });

  const getContainerRect = () => {
    if (!container) return;
    const nodesRef: WechatMiniprogram.NodesRef = container();
    return new Promise((resolve) => nodesRef.boundingClientRect(resolve).exec());
  };

  const handleScroll = () => {};

  React.useEffect(() => {
    handleScroll();
  }, [offsetTop, disabled, container]);

  return <View>{children}</View>;
};

Sticky.defaultProps = {
  zIndex: 99,
};

export default Sticky;
