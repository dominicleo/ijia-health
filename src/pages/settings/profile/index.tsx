import * as React from 'react';
import { chooseImage, View } from 'remax/wechat';
import classnames from 'classnames';

import s from './index.less';
import { useRequest } from '@/hooks';
import { MinepageService, UserService } from '@/services';
import { usePageEvent } from 'remax/macro';
import Empty from '@/components/empty';
import { MESSAGE } from '@/constants';
import Button from '@vant/weapp/lib/button';
import Skeleton from '@vant/weapp/lib/skeleton';
import { isNativeCancel } from '@/utils';
import Toast from '@/components/toast';
import history from '@/utils/history';
import PAGE from '@/constants/page';

const CERTIFICATION_TEXT = '去认证';

const ViewHoverProps = {
  hoverClassName: 'clickable',
  hoverStayTime: 0,
};

export default () => {
  const { data, loading, error, run, mutate } = useRequest(
    async () => {
      const [userinfo, isRealname, { avatar }] = await Promise.all([
        UserService.userinfo(),
        UserService.isRealname(),
        MinepageService.query(),
      ]);

      return { ...userinfo, isRealname, avatar, loaded: true };
    },
    { manual: true },
  );

  const { loading: uploading, run: upload } = useRequest(UserService.uploadAvatar, {
    onSuccess(response, [params]) {
      if (response) {
        mutate((next) => ({ ...next, avatar: params }));
      }
    },
    manual: true,
  });

  usePageEvent('onShow', run);

  React.useEffect(() => {
    uploading ? Toast.loading({ duration: 0 }) : Toast.clear();
    return () => {
      Toast.clear();
    };
  }, [uploading]);

  const { name, idCardNumber, phoneNumber, isRealname, avatar } = data || {};

  const onClick = () => {
    if (!data?.loaded || loading) return;
    history.push(PAGE.CERTIFICATION);
  };

  const onClickUploadAvatar = async () => {
    try {
      const { tempFilePaths } = await chooseImage({ sourceType: ['album', 'camera'] });
      const [file] = tempFilePaths;
      upload(file);
    } catch (error) {
      if (isNativeCancel(error)) return;
      Toast('拨打客服热线失败，请重试');
    }
  };

  let content;

  if (data?.loaded) {
    const avatarStyle: React.CSSProperties = avatar ? { backgroundImage: `url(${avatar})` } : {};

    content = (
      <>
        <Toast.Component />
        <View className={s.list}>
          <View
            {...ViewHoverProps}
            className={classnames(s.item, s.arrow)}
            onClick={onClickUploadAvatar}
          >
            头像
            <View className={s.extra}>
              <View className={s.avatar} style={avatarStyle} />
            </View>
          </View>
        </View>
        <View className={s.list}>
          <View className={s.item}>
            手机号
            <View className={s.extra}>{phoneNumber}</View>
          </View>
          <View
            {...(isRealname ? {} : ViewHoverProps)}
            className={classnames(s.item, { [s.arrow]: !isRealname })}
            onClick={onClick}
          >
            姓名
            <View className={classnames(s.extra, { [s.active]: !isRealname })}>
              {isRealname && <View className={s.realname} />}
              {isRealname ? name : CERTIFICATION_TEXT}
            </View>
          </View>
          <View
            {...(isRealname ? {} : ViewHoverProps)}
            className={classnames(s.item, { [s.arrow]: !isRealname })}
            onClick={onClick}
          >
            身份证号
            <View className={classnames(s.extra, { [s.active]: !isRealname })}>
              {isRealname ? idCardNumber : CERTIFICATION_TEXT}
            </View>
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
