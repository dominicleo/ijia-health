import fetch from '@/utils/fetch';

import ArticleMapper from './index.mapper';

export const query = async (doctorId: string) => {
  const response = await fetch.post('/api/api/reward/getRewardInfo', null, {
    params: { doctorId },
  });
  return ArticleMapper.query(response.data);
};

export const homepage = async () => {
  const response = await fetch.get('/api/article/index');
  return ArticleMapper.homepage(response.data);
};

export const read = (id: number | string) => {
  return fetch.post(`/api/article/${id}/reads`);
};

export const like = (id: number | string) => {
  return fetch.post(`/api/article/${id}/likes`);
};

export const share = (id: number | string) => {
  return fetch.post(`/api/article/${id}/shares`);
};
export const bookmark = (id: number | string) => {
  return fetch.post(`/api/article/${id}/bookmark`);
};
