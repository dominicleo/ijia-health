import fetch from '@/utils/fetch';
import { UserService } from '..';

import MinipageMapper from './index.mapper';

export const query = async () => {
  const [response, isAuthorize] = await Promise.all([
    fetch.post('/api/app/minePage'),
    UserService.checkAuthorize()
      .then(() => true)
      .catch(() => false),
  ]);
  return { ...MinipageMapper.query(response.data), isAuthorize };
};
