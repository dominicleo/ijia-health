import { EventEmitter } from '@/hooks/useEventEmitter';
import * as React from 'react';
import { ChatingAction } from './types';

const ChatingContext = React.createContext<{
  chating$?: EventEmitter<ChatingAction>;
}>({});

export default ChatingContext;
