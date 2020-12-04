import fetch from '@/utils/fetch';

import SubscribeMapper from './index.mapper';

export const query = async (type: string) => {
  const response = await fetch.post('/api/message/getSubscribeTemplates', null, {
    params: { business: type },
  });
  return SubscribeMapper.query(response.data);
};
