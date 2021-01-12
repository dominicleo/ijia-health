import { AxiosAdapter } from 'axios';
import buildFullPath from 'axios/lib/core/buildFullPath';
import settle from 'axios/lib/core/settle';
import buildURL from 'axios/lib/helpers/buildURL';

import { hasOwnProperty, isPlainObject } from '../';
import { encode, isJSONString, transformError, transformResponse } from './utils';

export const UPLOAD_FILE_FLAG = 'UPLOAD_FILE_FLAG';

const adapter: AxiosAdapter = (config) => {
  return new Promise((resolve, reject) => {
    let task: WechatMiniprogram.RequestTask | WechatMiniprogram.UploadTask | void;

    const method = ((config.method && config.method.toUpperCase()) ||
      'GET') as WechatMiniprogram.RequestOption['method'];

    let data = config.data;
    const headers = config.headers;
    const options: WechatMiniprogram.RequestOption = {
      url: buildURL(
        buildFullPath(config.baseURL, config.url),
        config.params,
        config.paramsSerializer,
      ),
      method,
      success(response: any) {
        settle(resolve, reject, transformResponse(response, config, response));
      },
      fail(error) {
        transformError(error, reject, config);
      },
      complete() {
        task = undefined;
      },
    };

    if (config.auth) {
      const [username, password] = [config.auth.username || '', config.auth.password || ''];
      headers.Authorization = 'Basic ' + encode(username + ':' + password);
    }

    Object.entries(headers).forEach(([key, value]) => {
      const headerKey = key.toLowerCase();
      if (
        (typeof data === 'undefined' && headerKey === 'content-type') ||
        headerKey === 'referer'
      ) {
        delete headers[key];
      }
    });

    options.header = headers;

    if (config.responseType) {
      options.responseType = config.responseType as 'text' | 'arraybuffer';
    }

    if (config.cancelToken) {
      config.cancelToken.promise.then((cancel) => {
        if (!task) return;
        task.abort();
        reject(cancel);
        task = undefined;
      });
    }

    if (isJSONString(data)) {
      data = JSON.parse(data);
    }

    if (data !== undefined) {
      options.data = data;
    }

    if (
      method === 'POST' &&
      isPlainObject(options.data) &&
      hasOwnProperty(options.data, UPLOAD_FILE_FLAG)
    ) {
      const { data, ...restOptions } = options;
      const { UPLOAD_FILE_FLAG, name, filePath, ...restData } = data;
      task = wx.uploadFile({
        ...restOptions,
        name: name || 'file',
        filePath,
        formData: restData,
      });
    } else {
      task = wx.request(options);
    }
  });
};

export default adapter;
