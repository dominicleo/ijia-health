import { AppConfig } from 'remax/wechat';

import { COMMON, TABBAR } from './constants';

const config: AppConfig = {
  tabBar: {
    color: '#666',
    selectedColor: '#0A95FF',
    backgroundColor: '#fff',
    list: TABBAR.LIST,
  },
  pages: [
    'pages/index/index',
    'pages/archives/index',
    // 'pages/message/index',
    // 'pages/me/index',
    'pages/authorize/index',
  ],
  subpackages: [
    // {
    //   name: 'reward',
    //   root: 'pages/reward',
    //   pages: ['index'],
    // },
    {
      name: 'cashier',
      root: 'pages/cashier',
      pages: ['index', 'result/index'],
    },
  ],
  window: {
    navigationBarBackgroundColor: '#fff',
    navigationBarTextStyle: 'black',
    navigationBarTitleText: COMMON.APP_NAME,
  },
  networkTimeout: {
    request: 15000,
    uploadFile: 30000,
  },
};

export default config;
