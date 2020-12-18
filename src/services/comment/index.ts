import { isPlainObject } from '@/utils';
import fetch from '@/utils/fetch';

import CommentMapper from './index.mapper';
import { CommentGetListParams, CommentReportParams, CommentSubmitParams } from './index.types';

const GET_LIST_DEFAULT_PARAMS = { page: 1, size: 10 };

export const getList = async (params: CommentGetListParams) => {
  const rest = { ...GET_LIST_DEFAULT_PARAMS, ...params };
  const response = await fetch.get('/api/article/comment/getCommentByArticleId', {
    params: { ...GET_LIST_DEFAULT_PARAMS, ...params },
  });

  return CommentMapper.getList(Object.assign({}, rest, response.data));
};

export const submit = (params: CommentSubmitParams) => {
  return fetch.post('/api/article/comment', params);
};

export const report = (params: CommentReportParams) => {
  return fetch.post('/api/article/comment/report', null, { params });
};

export const getReportOptions = async () => {
  const response = await fetch.get('/api/article/comment/getReportType');
  const data = isPlainObject(response.data)
    ? Object.entries(response.data).map(([value, label]) => ({ value, label }))
    : [];
  return data;
};
