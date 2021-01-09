import fetch from '@/utils/fetch';

import ArticleMapper from './index.mapper';
import { ArticleGetListParams, ArticleId } from './index.types';

export const query = async (articleId: ArticleId) => {
  const response = await fetch.get(`/api/article/${articleId}`);
  return ArticleMapper.query(response.data);
};

export const homepage = async () => {
  const response = await fetch.get('/api/article/index');
  return ArticleMapper.homepage(response.data);
};

export const read = (articleId: ArticleId) => {
  return fetch.post(`/api/article/${articleId}/reads`);
};

export const like = (articleId: ArticleId) => {
  return fetch.post(`/api/article/${articleId}/likes`);
};

export const share = (articleId: ArticleId) => {
  return fetch.post(`/api/article/${articleId}/shares`);
};
export const bookmark = (articleId: ArticleId) => {
  return fetch.post(`/api/article/${articleId}/bookmark`);
};

const GET_LIST_DEFAULT_PARAMS = { page: 1, size: 10 };

export const getList = async (params?: ArticleGetListParams) => {
  const response = await fetch.get(`/api/article/list/category`, {
    params: { ...GET_LIST_DEFAULT_PARAMS, ...params },
  });

  return ArticleMapper.getList(response.data);
};

export const getBookmarkList = async (params?: ArticleGetListParams) => {
  const response = await fetch.get('/api/article/bookmark', {
    params: { ...GET_LIST_DEFAULT_PARAMS, ...params },
  });

  return ArticleMapper.getList(response.data);
};

export async function removeBookmarkList(ids: ArticleId[]) {
  return fetch.delete('/api/article', { data: ids });
}

export const getSpecialList = async (params?: ArticleGetListParams) => {
  const response = await fetch.get(`/api/article/special`, {
    params: { ...GET_LIST_DEFAULT_PARAMS, ...params },
  });

  return ArticleMapper.getList(response.data);
};
