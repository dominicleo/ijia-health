import axios from 'axios/dist/axios';
import { getStorageSync } from 'remax/wechat';

import { STORAGE } from '@/constants';

import { isPlainObject, isRelease } from '../';
import { SERVICE_URL } from '../baseURL';
import { AuthorizeError, NetworkError, ServerError, ServiceError } from '../error';
import adapter from './adapter';

const headers = {
  'Content-Type': 'application/json;charset=UTF-8',
  appLabelCode: 'PATIENT',
  sysType: 'mini',
  version: '1.0.0',
  token: 'not authorize',
};

const fetch = axios.create({
  baseURL: SERVICE_URL,
  headers,
  adapter,
});

fetch.interceptors.request.use((config) => {
  const token = getStorageSync(STORAGE.ACCESS_TOKEN);
  if (token) {
    config.headers.token = token;
  }
  return config;
});

fetch.interceptors.response.use(
  (response): any => {
    const { code, message, data = {} } = response?.data || {};

    if (code !== 200) {
      return Promise.reject(new ServiceError(message, code));
    }

    return { code, message, data };
  },
  (error) => {
    const { data, status = 0 } = error.response || {};
    const response = isPlainObject(data) ? data : {};
    const message = response?.message || response?.msg || error.message;

    if (/timeout/i.test(error.message)) {
      return Promise.reject(new NetworkError(`服务请求超时`));
    }

    if (/Network Error/i.test(error.message)) {
      return Promise.reject(
        new NetworkError(`无法连接的服务器${!isRelease ? '，请检查是否开启调试模式' : ''}`),
      );
    }

    if (response.code === 4119402) {
      return Promise.reject(new AuthorizeError(message));
    }

    return Promise.reject(new ServerError(message, status));
  },
);

export default fetch;
