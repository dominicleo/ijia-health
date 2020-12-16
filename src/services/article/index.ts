import fetch from '@/utils/fetch';

import ArticleMapper from './index.mapper';
import { ArticleGetListParams } from './index.types';

export const query = async (articleId: number | string) => {
  const response = await fetch.get(`/api/article/${articleId}`);
  return ArticleMapper.query(response.data);
};

export const homepage = async () => {
  const response = await fetch.get('/api/article/index');
  return ArticleMapper.homepage(response.data);
};

export const read = (articleId: number | string) => {
  return fetch.post(`/api/article/${articleId}/reads`);
};

export const like = (articleId: number | string) => {
  return fetch.post(`/api/article/${articleId}/likes`);
};

export const share = (articleId: number | string) => {
  return fetch.post(`/api/article/${articleId}/shares`);
};
export const bookmark = (articleId: number | string) => {
  return fetch.post(`/api/article/${articleId}/bookmark`);
};

const DEFAULT_PARAMS = { page: 1, size: 10 };

export const getList = async (params?: ArticleGetListParams) => {
  const response = await fetch.get(`/api/article/list/category`, {
    params: Object.assign(DEFAULT_PARAMS, params),
  });

  return ArticleMapper.getList(response.data);
};

export const getSpecialList = async (params?: ArticleGetListParams) => {
  const response = await fetch.get(`/api/article/special`, {
    params: Object.assign(DEFAULT_PARAMS, params),
  });

  return ArticleMapper.getList(response.data);
};
