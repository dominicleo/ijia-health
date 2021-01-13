import Button from '@vant/weapp/lib/button';
import * as React from 'react';
import { chooseImage, Input, View } from 'remax/wechat';
import classnames from 'classnames';

import s from './index.less';
import Toast from '@/components/toast';
import { useRequest, useUpdateEffect } from '@/hooks';
import { UserService } from '@/services';
import { IDENTITY_CARD_SIDE } from '@/services/user/index.types.d';
import { isNativeCancel } from '@/utils';
import history from '@/utils/history';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';

const UPLOADING_TEXT = '正在上传';
const CLICK_UPLOAD_TEXT = '点击上传';
const REUPLOAD_TEXT = '重新上传';

const DEFAULT_USERINFO = {
  name: '',
  idCard: '',
  birthDay: '',
  age: 0,
  address: '',
  idCardType: 'ID_CARD',
  sex: '',
  loaded: false,
};

export default () => {
  const [state, setState] = React.useState<{ front?: string; back?: string }>({});
  const [userinfo, setUserinfo] = React.useState(DEFAULT_USERINFO);

  const { run: update, loading: uploading } = useRequest(UserService.uploadIdentityCard, {
    manual: true,
    onSuccess(response) {
      const { name, idCardNumber, birthday, address, sex } = response;
      setUserinfo({
        ...userinfo,
        name,
        idCard: idCardNumber,
        birthDay: birthday,
        address,
        sex,
        loaded: true,
      });
    },
  });

  const { run: submit, loading: submitting } = useRequest(UserService.updateIdentityCardInfo, {
    manual: true,
    onSuccess() {
      Toast.success({ message: '实名认证成功', onClose: history.back });
    },
  });

  useUpdateEffect(() => {
    if (state.front && state.back) {
      update({ side: IDENTITY_CARD_SIDE.FRONT, filePath: state.front });
    }
  }, [state]);

  const onClick = async (side: string) => {
    try {
      const { tempFilePaths } = await chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['camera', 'album'],
      });

      const [file] = tempFilePaths;
      setState({ ...state, [side]: file });
    } catch (error) {
      if (isNativeCancel(error)) return;
      Toast(error.errMsg);
    }
  };

  const onSubmit = async () => {
    if (!userinfo.name) {
      Toast('请输入姓名');
      return;
    }
    if (!userinfo.idCard) {
      Toast('请输入身份证号');
      return;
    }

    const { loaded, ...params } = userinfo;
    submit(params);
  };

  const items = [
    {
      key: 'front',
      title: '身份证正面',
      subtitle: '上传您的身份证人像面',
      picture: state.front,
    },
    {
      key: 'back',
      title: '身份证反面',
      subtitle: '上传您的身份证国徽面',

      picture: state.back,
    },
  ];

  return (
    <>
      <Toast.Component />
      <View className={s.wrapper}>
        <View>
          <View className={s.main}>
            <View className={s.header}>
              为了给你提供更好的服务，根据相关政策，需进行实名认证，您的信息我们将严格保密
            </View>
            <View>
              {items.map((item) => (
                <View key={item.key} className={s.item}>
                  <View>
                    <View className={s.title}>{item.title}</View>
                    <View className={s.subtitle}>{item.subtitle}</View>
                    <Button
                      bindclick={() => onClick(item.key)}
                      customClass={s.upload}
                      type='primary'
                      size='small'
                      loadingText={UPLOADING_TEXT}
                      loadingSize='14px'
                      disabled={uploading}
                      loading={uploading}
                      round
                    >
                      {CLICK_UPLOAD_TEXT}
                    </Button>
                  </View>
                  <View
                    className={classnames(s.picture, s[item.key])}
                    style={item.picture ? { backgroundImage: `url(${item.picture})` } : {}}
                  />
                </View>
              ))}
            </View>
          </View>
          {userinfo.loaded && (
            <View className={s.confirm}>
              <View>
                <View className={s.field}>
                  <View className={s.label}>本人姓名</View>
                  <Input
                    placeholderClassName={s.placeholder}
                    value={userinfo.name}
                    data-name='name'
                    className={s.value}
                    placeholder='请输入姓名'
                    disabled={submitting || uploading}
                    onInput={(event) => setUserinfo({ ...userinfo, name: event.detail.value })}
                  />
                </View>
                <View className={s.field}>
                  <View className={s.label}>身份证号</View>
                  <Input
                    placeholderClassName={s.placeholder}
                    value={userinfo.idCard}
                    data-name='idCard'
                    className={s.value}
                    placeholder='请输入身份证号'
                    disabled={submitting || uploading}
                    onInput={(event) => setUserinfo({ ...userinfo, idCard: event.detail.value })}
                    maxlength={20}
                  />
                </View>
              </View>
              <Button
                bindclick={onSubmit}
                customClass={s.submit}
                color={LINEAR_GRADIENT_PRIMARY}
                disabled={submitting || !userinfo.name || !userinfo.idCard}
                loading={submitting}
                loadingText='正在提交'
                round
                block
              >
                确认无误，去认证
              </Button>
              <View className={s.message}>若信息有误，请重新上传证件图片</View>
            </View>
          )}
        </View>
        <View className={s.security}>爱加健康承诺，严格保障您的隐私安全</View>
      </View>
    </>
  );
};
