import fetch from '@/utils/fetch';

import MessageMapper from './index.mapper';
import { MESSAGE_TYPE } from './index.types';

export const query = async (type: MESSAGE_TYPE) => {
  const response = await fetch.get('/api/message/notification', { params: { type } });
  return MessageMapper.query(response.data);
};
