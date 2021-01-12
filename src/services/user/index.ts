import fetch, { upload } from '@/utils/fetch';

import UserMapper from './index.mapper';
import { AuthorizeParams, UploadIdentityCardParams } from './index.types';

export const authorize = async (params: AuthorizeParams) => {
  const response = await fetch.post('/api/wechat/app/login', params);
  return UserMapper.authorize(response.data);
};

export const userinfo = async () => {
  const response = await fetch.post('/api/api/userInfo/getUserInfoByWeApp', {});
  return UserMapper.userinfo(response.data);
};

export const uploadAvatar = async (filePath: string): Promise<boolean> => {
  const response = await upload('/api/user/avatar', { filePath: filePath });
  return !!response.data;
};

export const uploadIdentityCard = async (params: UploadIdentityCardParams) => {
  const { side, filePath } = params;
  const response = await upload(
    '/api/api/userInfo/getOcrUserInfo',
    { filePath },
    { params: { cardSide: side } },
  );
  return UserMapper.identityCard(response.data);
};

export const updateIdentityCardInfo = (params: any) => {
  return fetch.post('/api/api/userInfo/addUserInfo', params);
};

export function checkAuthorize() {
  return fetch.post('/api/api/app/isLogin');
}

export async function getYunxinConfig() {
  const response = await fetch.get('/api/user/im');
  return UserMapper.getYunxinConfig(response.data);
}

export async function isRealname(): Promise<boolean> {
  const response = await fetch.post('/api/api/userInfo/isRealName');
  return !!response?.data;
}
