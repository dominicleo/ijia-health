import classnames from 'classnames';
import * as React from 'react';
import { useNativeEffect } from 'remax';
import { usePageEvent } from 'remax/macro';
import { Button, Image, View } from 'remax/wechat';

import { CUSTOMER_SERVICE_TELEPHONE } from '@/constants/common';
import { useRequest } from '@/hooks';
import * as MeService from '@/services/old/me';
import * as UserService from '@/services/old/user';
import { isArray } from '@/utils';
import history from '@/utils/history';
import Icon from '@vant/weapp/lib/icon';
import NavBar from '@vant/weapp/lib/nav-bar';

import s from './index.module.less';

export default () => {
  // // 页面渲染状态
  // const [mounted, setMounted] = React.useState(false);
  // // 页面数据加载状态
  // const [loaded, setPageCompleted] = React.useState(false);
  // const { data, run, loading } = useRequest(
  //   async (): Promise<any> => {
  //     const [userinfo, isLogin] = await Promise.all([
  //       MeService.query(),
  //       UserService.checkAuthorize()
  //         .then(() => true)
  //         .catch(() => false),
  //     ]);

  //     return Object.assign({}, userinfo, { isLogin });
  //   },
  //   {
  //     manual: true,
  //     cacheKey: 'minepage',
  //     onSuccess() {
  //       !loaded && setPageCompleted(true);
  //     },
  //   },
  // );

  // useNativeEffect(() => {
  //   run();
  //   setMounted(true);
  // }, []);

  // usePageEvent('onShow', () => {
  //   const pages = getCurrentPages();
  //   const page = pages[pages.length - 1];
  //   const refer = page.__displayReporter.showReferpagepath;
  //   if (
  //     !mounted ||
  //     ['pages/settings/help/index.html', 'pages/settings/about/index.html'].includes(refer)
  //   ) {
  //     return;
  //   }
  //   run();
  // });

  // const onClick = (key: string) => {
  //   switch (key) {
  //     case 'HELP_CENTER':
  //       history.push(PAGE.HELP_CENTER);
  //       break;
  //     case 'ABOUT_WE':
  //       history.push(PAGE.ABOUT);
  //       break;
  //     case 'MY_PRESCRIPTION':
  //       history.push({ pathname: PAGE.PRESCRIBE_LIST, authorize: true });
  //       break;
  //   }
  // };

  // let entranceContent: any;

  // if (loaded && isArray(data.entrances)) {
  //   entranceContent = data.entrances.map(
  //     ({ id, key, title, icon }: any) =>
  //       ['SHARE', 'HELP_CENTER', 'ABOUT_WE'].includes(key) && (
  //         <View
  //           key={id}
  //           className={s.entrance}
  //           onTap={() => onClick(key)}
  //           wechat-hoverClass='clickable'
  //         >
  //           <View className={s.icon} style={icon ? { backgroundImage: `url(${icon})` } : {}} />
  //           <View className={s.title}>{title}</View>
  //           <Icon name='arrow' />
  //           {key === 'SHARE' && <Button wechat-open-type='share' />}
  //         </View>
  //       ),
  //   );
  // } else {
  //   entranceContent = Array.from(Array(3).keys()).map((_, index: number) => (
  //     <View key={`entrance_loader_${index}`} className={classnames(s.entrance, s.loader)}>
  //       <View className={s.icon} />
  //       <View className={s.title} />
  //     </View>
  //   ));
  // }

  // const {
  //   tools,
  //   isLogin,
  //   username = '',
  //   registerTimes = 0,
  //   avatar,
  //   followNumber = 0,
  //   collectNumber = 0,
  // } = data || {};
  // const avatarStyle = avatar ? { backgroundImage: `url(${avatar})` } : {};

  // return (
  //   <View className={s.wrapper}>
  //     <View className={s.header}>
  //       <View
  //         className={s.tips}
  //         onTap={() => history.push({ pathname: PAGE.MY_DOCTOR, authorize: true })}
  //       />

  //       <NavBar border={false} />
  //       <View className={s.userinfo}>
  //         <View>
  //           {loaded && (
  //             <>
  //               <View
  //                 className={s.username}
  //                 onTap={!isLogin ? () => history.push(PAGE.AUTHORIZE) : undefined}
  //               >
  //                 {isLogin ? <>你好！{username}</> : <>未登录</>}
  //               </View>
  //               <View className={s.description}>
  //                 {isLogin ? <>你我相识已{registerTimes}天</> : <>您还没有登录哦</>}
  //               </View>
  //             </>
  //           )}
  //         </View>
  //         <View
  //           className={s.avatarWrapper}
  //           onTap={() => history.push({ pathname: PAGE.PROFILE, authorize: true })}
  //         >
  //           <View className={s.avatar} style={avatarStyle} />
  //           {isLogin && <View className={s.edit}>编辑</View>}
  //         </View>
  //       </View>
  //       <View className={s.main}>
  //         <View onTap={() => history.push({ pathname: PAGE.DOCTOR_FOLLOW_LIST, authorize: true })}>
  //           <View className={s.label}>关注</View>
  //           <View className={s.value}>{followNumber}</View>
  //         </View>
  //         <View
  //           onTap={() => history.push({ pathname: PAGE.ARTICLE_BOOKMARK_LIST, authorize: true })}
  //         >
  //           <View className={s.label}>收藏</View>
  //           <View className={s.value}>{collectNumber}</View>
  //         </View>
  //       </View>
  //     </View>
  //     {/* {isArray(tools) && (
  //       <View className={s.tools}>
  //         {tools.map(
  //           ({ id, key, title, icon }: any) =>
  //             [35].includes(id) && (
  //               <View key={id} className={s.item} onTap={() => onClick(key)}>
  //                 <View
  //                   className={s.icon}
  //                   style={icon ? { backgroundImage: `url(${icon})` } : {}}
  //                 />
  //                 <View className={s.title}>{title}</View>
  //               </View>
  //             ),
  //         )}
  //       </View>
  //     )} */}

  //     {isArray(data?.tools) && data?.tools.length > 0 && (
  //       <View className={s.entrances}>
  //         {data.tools.map(
  //           ({ id, key, title, icon }: any) =>
  //             ['MY_PRESCRIPTION'].includes(key) && (
  //               <View
  //                 key={id}
  //                 className={s.entrance}
  //                 onTap={() => onClick(key)}
  //                 wechat-hoverClass='clickable'
  //               >
  //                 <View
  //                   className={s.icon}
  //                   style={
  //                     icon
  //                       ? {
  //                           backgroundImage: `url(https://dev-m.ijia120.com/miniprograms/icon-chufang.png)`,
  //                         }
  //                       : {}
  //                   }
  //                 />
  //                 <View className={s.title}>{title}</View>
  //                 <Icon name='arrow' />
  //               </View>
  //             ),
  //         )}
  //       </View>
  //     )}
  //     <View className={s.entrances}>{entranceContent}</View>
  //     <View className={s.slogan} />
  //     <View className={s.servicePhone}>爱加健康服务热线：{CUSTOMER_SERVICE_TELEPHONE}</View>
    </View>
  );
};
