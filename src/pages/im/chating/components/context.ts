import { EventEmitter } from '@/hooks/useEventEmitter';
import * as React from 'react';
import { MessagebarAction } from './types';

const ChatingContext = React.createContext<{
  messagebar$?: EventEmitter<MessagebarAction>;
}>({});

export default ChatingContext;
