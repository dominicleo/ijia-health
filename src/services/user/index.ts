import fetch from '@/utils/fetch';

import UserMapper from './index.mapper';
import { AuthorizeParams } from './index.types';

export const authorize = async (params: AuthorizeParams) => {
  const response = await fetch.post('/api/wechat/app/login', params);
  return UserMapper.authorize(response.data);
};

export function checkAuthorize() {
  return fetch.post('/api/api/app/isLogin');
}
