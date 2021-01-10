import * as React from 'react';
import { View } from 'remax/wechat';
import classnames from 'classnames';

import s from './index.less';
import { useRequest } from '@/hooks';
import { MinepageService, UserService } from '@/services';
import { usePageEvent } from 'remax/macro';
import Empty from '@/components/empty';
import { MESSAGE } from '@/constants';
import Button from '@vant/weapp/lib/button';
import Skeleton from '@vant/weapp/lib/skeleton';

const CERTIFICATION_TEXT = '去认证';

export default () => {
  const { data, loading, error, run } = useRequest(
    async () => {
      const [userinfo, { avatar }] = await Promise.all([
        UserService.userinfo(),
        MinepageService.query(),
      ]);

      return { ...userinfo, avatar, loaded: true };
    },
    { manual: true },
  );

  // usePageEvent('onShow', run);

  let content;

  if (data?.loaded) {
    const { name, idCardNumber, phoneNumber, avatar } = data || {};
    const avatarStyle: React.CSSProperties = avatar ? { backgroundImage: `url(${avatar})` } : {};

    content = (
      <>
        <View className={s.list}>
          <View
            className={classnames(s.item, s.arrow)}
            hoverClassName='clickable'
            hoverStayTime={0}
          >
            头像
            <View className={s.extra}>
              <View className={s.avatar} style={avatarStyle} />
            </View>
          </View>
        </View>
        <View className={s.list}>
          <View className={classnames(s.item, s.arrow)}>手机号</View>
          <View
            className={classnames(s.item, s.arrow)}
            hoverClassName='clickable'
            hoverStayTime={0}
          >
            姓名
            <View className={classnames(s.extra, { [s.active]: true })}>去认证</View>
          </View>
          <View
            className={classnames(s.item, s.arrow)}
            hoverClassName='clickable'
            hoverStayTime={0}
          >
            身份证号
            <View className={classnames(s.extra, { [s.active]: true })}>去认证</View>
          </View>
        </View>
      </>
    );
  } else if (error) {
    content = (
      <Empty
        image='record'
        description={
          <>
            {MESSAGE.REQUEST_FAILED}
            <View>{error.message}</View>
          </>
        }
      >
        <Button
          type='primary'
          size='small'
          bindclick={run}
          loading={loading}
          disabled={loading}
          round
        >
          {MESSAGE.RETRY}
        </Button>
      </Empty>
    );
  } else {
    content = (
      <>
        <View className={s.list}>
          <View className={s.item}>
            头像
            <View className={s.extra}>
              <View className={s.avatar} />
            </View>
          </View>
        </View>
        <View className={s.list}>
          <View className={s.item}>
            手机号
            <View className={s.extra}>
              <Skeleton title loading />
            </View>
          </View>
          <View className={s.item}>
            姓名
            <View className={s.extra}>
              <Skeleton title loading />
            </View>
          </View>
          <View className={s.item}>
            身份证号
            <View className={s.extra}>
              <Skeleton title loading />
            </View>
          </View>
        </View>
      </>
    );
  }

  return <View className={s.wrapper}>{content}</View>;
};
