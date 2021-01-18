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
    'pages/message/index',
    'pages/me/index',
    'pages/authorize/index',
    // 'pages/example/index',
  ],
  subpackages: [
    {
      name: 'webview',
      root: 'pages/webview',
      pages: ['index'],
    },
    {
      name: 'article',
      root: 'pages/article',
      pages: ['index', 'list/index', 'bookmark/index', 'column/index'],
    },
    {
      name: 'doctor',
      root: 'pages/doctor',
      pages: ['index', 'search/index', 'scan/index', 'follow/index', 'my-doctor/index'],
    },
    {
      name: 'reward',
      root: 'pages/reward',
      pages: ['index'],
    },
    // {
    //   name: 'payment',
    //   root: 'pages/payment',
    //   pages: ['index', 'result/index'],
    // },
    {
      name: 'cashier',
      root: 'pages/cashier',
      pages: ['index', 'result/index'],
    },
    {
      name: 'im',
      root: 'pages/im',
      pages: ['chating/index', 'videocall/index'],
    },
    {
      name: 'help',
      root: 'pages/help',
      pages: ['index', 'list/index'],
    },
    {
      name: 'settings',
      root: 'pages/settings',
      pages: ['about/index', 'profile/index', 'certification/index'],
    },
    {
      name: 'prescription',
      root: 'pages/prescription/',
      pages: [
        'index',
        'details/index',
        'order/details/index',
        'order/confirm/index',
        'payment/index',
        'payment/result/index',
        'information/index',
        'information/confirm/index',
      ],
    },
    {
      name: 'prescribe',
      root: 'pages/prescribe',
      pages: [
        'index',
        'details/index',
        'logistics/index',
        'delivery-address/index',
        'delivery-address/list/index',
        'order/list/index',
        'order/confirm/index',
        'order/details/index',
        'pharmacy/list/index',
        'pharmacy/recommend/index',
        'payment/index',
        'payment/result/index',
      ],
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
