import * as React from 'react';
import { getLaunchOptionsSync, View } from 'remax/wechat';

import { APP_ID } from '@/constants/common';
import PAGE from '@/constants/page';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { isPlainObject } from '@/utils';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';

import s from './index.less';
import Toast from '@/components/toast';
import { useQuery } from 'remax';

const LaunchApp: React.FC = React.memo(() => {
  const { articleId } = useQuery<{ articleId: string }>();
  const { scene, referrerInfo } = getLaunchOptionsSync();
  const visible =
    scene === 1036 ||
    (scene === 1069 && isPlainObject(referrerInfo) && referrerInfo.appId === APP_ID);

  const onLaunchApp = () => {
    Toast('请在 APP 中查看');
  };

  const onLaunchAppError = () => {
    history.push(PAGE.ARCHIVES);
  };

  return visible ? (
    <View className={s.launch}>
      <Button
        color={LINEAR_GRADIENT_PRIMARY}
        open-type='launchApp'
        bindlaunchapp={onLaunchApp}
        binderror={onLaunchAppError}
        app-parameter={JSON.stringify({
          id: articleId,
          targetPageCode: 'DETAIL_ARTICLES',
        })}
      >
        打开 APP
      </Button>
    </View>
  ) : (
    <></>
  );
});

export default LaunchApp;
