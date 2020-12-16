import { Mutate } from '@/hooks/useRequest/types';
import { Article } from '@/services/article/index.types';
import { noop } from '@/utils';
import * as React from 'react';

const ArticleContext = React.createContext<{ mutate: Mutate<Article & { loaded: boolean }> }>({
  mutate: noop,
});

export default ArticleContext;
