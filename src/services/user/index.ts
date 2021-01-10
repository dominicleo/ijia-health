import fetch from '@/utils/fetch';

import UserMapper from './index.mapper';
import { AuthorizeParams } from './index.types';

export const authorize = async (params: AuthorizeParams) => {
  const response = await fetch.post('/api/wechat/app/login', params);
  return UserMapper.authorize(response.data);
};

export const userinfo = async () => {
  const response = await fetch.post('/api/api/userInfo/getUserInfoByWeApp');
  return response.data;
};

export function checkAuthorize() {
  return fetch.post('/api/api/app/isLogin');
}

export async function getYunxinConfig() {
  const response = await fetch.get('/api/user/im');
  return UserMapper.getYunxinConfig(response.data);
}
