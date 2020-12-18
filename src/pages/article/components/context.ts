import { EventEmitter } from '@/hooks/useEventEmitter';
import { Mutate } from '@/hooks/useRequest/types';
import { Article } from '@/services/article/index.types';
import { noop } from '@/utils';
import * as React from 'react';

export type CommentEventAction = 'focus' | 'reload';

const ArticleContext = React.createContext<{
  mutate: Mutate<Article & { loaded: boolean }>;
  comment$?: EventEmitter<CommentEventAction>;
}>({
  mutate: noop,
});

export default ArticleContext;
