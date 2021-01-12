import { AxiosRequestConfig, AxiosResponse } from 'axios';
import createError from 'axios/lib/core/createError';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export const encode = (input: any) => {
  const value = String(input);
  let block;
  let charCode;
  let idx = 0;
  let map = CHARS;
  let output = '';
  for (
    ;
    value.charAt(idx | 0) || ((map = '='), idx % 1);
    output += map.charAt(63 & (block >> (8 - (idx % 1) * 8)))
  ) {
    charCode = value.charCodeAt((idx += 3 / 4));
    if (charCode > 0xff) {
      throw new Error(
        "'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.",
      );
    }
    // @ts-ignore
    block = (block << 8) | charCode;
  }
  return output;
};

export const isJSONString = (value: string) => {
  try {
    return (
      typeof value === 'string' &&
      value.length &&
      (value = JSON.parse(value)) &&
      Object.prototype.toString.call(value) === '[object Object]'
    );
  } catch (error) {
    return false;
  }
};

interface Reponse extends AxiosResponse {
  header: object;
  status: number;
  statusCode: number;
}

export function transformResponse(
  response: Reponse,
  config: AxiosRequestConfig,
  options: WechatMiniprogram.RequestOption,
): AxiosResponse {
  const headers = response.header || response.headers;
  const status = response.statusCode || response.status;

  let statusText = '';
  if (status === 200) {
    statusText = 'OK';
  } else if (status === 400) {
    statusText = 'Bad Request';
  }

  return {
    data: response.data,
    status,
    statusText,
    headers,
    config,
    request: options,
  };
}

export function transformError(error: any, reject: Function, config: AxiosRequestConfig) {
  if (error.errMsg.indexOf('request:fail abort') !== -1) {
    reject(createError('Request aborted', config, 'ECONNABORTED', ''));
  } else if (error.errMsg.indexOf('timeout') !== -1) {
    reject(createError('timeout of ' + config.timeout + 'ms exceeded', config, 'ECONNABORTED', ''));
  } else {
    reject(createError('Network Error', config, null, ''));
  }
}
