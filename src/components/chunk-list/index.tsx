import useSetState from '@/hooks/useSetState';
import * as React from 'react';
import { usePageInstance } from 'remax';
import { createIntersectionObserver, nextTick, View } from 'remax/wechat';

interface ChunkListProps {
  chunkId: number | string;
  observeHeight?: number;
}

const ChunkList: React.FC<ChunkListProps> = React.memo(({ chunkId, observeHeight, children }) => {
  const instance = usePageInstance();
  const observer = React.useRef(createIntersectionObserver(instance));
  const chunkPrefix = React.useRef(Math.random().toString(36).slice(-8));
  const [state, setState] = useSetState({ height: 0, visible: true });

  const init = () => {
    if (!observer.current) return;
    observer.current
      .relativeToViewport({ top: observeHeight, bottom: observeHeight })
      .observe(
        `#${chunkPrefix.current}_${chunkId}`,
        ({ intersectionRatio, boundingClientRect }) => {
          if (intersectionRatio === 0) {
            setState({ visible: false });
            return;
          }
          setState({ height: boundingClientRect.height, visible: true });
        },
      );
  };

  React.useEffect(() => {
    nextTick(init);
    return () => {
      observer.current && observer.current.disconnect();
    };
  }, []);

  return (
    <View id={`${chunkPrefix.current}_${chunkId}`} style={{ minHeight: state.height + 'PX' }}>
      {state.visible && children}
    </View>
  );
});

ChunkList.defaultProps = {
  observeHeight: 0,
};

export default ChunkList;
