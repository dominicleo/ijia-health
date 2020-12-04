export const LIST = [
  {
    text: '首页',
    pagePath: 'pages/index/index',
    iconPath: '/images/tabbar/icon-home.png',
    selectedIconPath: '/images/tabbar/icon-home-selected.png',
  },
  {
    text: '档案',
    pagePath: 'pages/archives/index',
    iconPath: '/images/tabbar/icon-archives.png',
    selectedIconPath: '/images/tabbar/icon-archives-selected.png',
  },
  // {
  //   text: '消息',
  //   pagePath: 'pages/message/index',
  //   iconPath: '/images/tabbar/icon-message.png',
  //   selectedIconPath: '/images/tabbar/icon-message-selected.png',
  // },
  // {
  //   text: '我的',
  //   pagePath: 'pages/me/index',
  //   iconPath: '/images/tabbar/icon-user.png',
  //   selectedIconPath: '/images/tabbar/icon-user-selected.png',
  // },
];

export const PATHS = LIST.map(({ pagePath }) => pagePath);
