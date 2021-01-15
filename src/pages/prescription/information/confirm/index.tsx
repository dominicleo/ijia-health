import * as React from 'react';
import { useQuery } from 'remax';
import { showModal, View } from 'remax/wechat';

import Empty from '@/components/empty';
import Toast from '@/components/toast';
import PAGE from '@/constants/page';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import YunxinContainer from '@/containers/im';
import { useRequest } from '@/hooks';
import * as PrescriptionService from '@/services/prescription';
import { AuthorizeError } from '@/utils/error';
import history from '@/utils/history';
import Yunxin, { NIM_SCENE } from '@/utils/im';
import Button from '@vant/weapp/lib/button';
import Skeleton from '@vant/weapp/lib/skeleton';

import s from './index.module.less';

function dataMasking(value: string, startIndex: number, endIndex: number, separator = '*'): string {
  const maskingLength = value.length - startIndex;
  const DATA_MASKING_REG = new RegExp(
    `^(.{${startIndex}})(?:[\\d|\u4e00-\u9fa5]+)(.{${value.length - endIndex}})$`,
  );
  return value.replace(
    DATA_MASKING_REG,
    `$1${separator.repeat(value.length - startIndex - (value.length - endIndex))}$2`,
  );
}

export default () => {
  const { id } = useQuery<{ id: string }>();

  // 页面数据加载状态
  const [loaded, setPageCompleted] = React.useState(false);
  const { data, error, run, loading } = useRequest(() => PrescriptionService.query(id), {
    onSuccess() {
      !loaded && setPageCompleted(true);
    },
  });

  if (error) {
    return (
      <Empty image='record' description={error.message}>
        <Button
          type='primary'
          size='small'
          bindclick={run}
          loading={loading}
          disabled={loading}
          round
        >
          重新加载
        </Button>
      </Empty>
    );
  }

  if (!loaded) {
    return (
      <View className={s.wrapper}>
        <View className={s.card}>
          <Skeleton title row={16} />
        </View>
      </View>
    );
  }

  const { userinfo, doctor } = data || {};

  const onClickOneSelf = async () => {
    const { account } = doctor || {};

    try {
      Toast.loading({ duration: 0 });
      // 绑定本人信息
      await PrescriptionService.bindToMe(id);

      if (!account) {
        Toast.clear();
        showModal({
          title: '系统提示',
          content: '页面参数异常',
          success() {
            history.push('/pages/index/index', null, { reLaunch: true });
          },
        });
        return;
      }

      // 初始化云信
      await Yunxin.init(false);

      const scene = NIM_SCENE.P2P;
      const sessionId = [scene, account].join('-');
      // 设置当前会话
      await YunxinContainer.setSessionId(sessionId);

      history.push(PAGE.CHATING, { sessionId, account, scene }, { reLaunch: true });

      Toast.clear();
    } catch (error) {
      if (AuthorizeError.is(error)) {
        history.push(PAGE.AUTHORIZE);
        return;
      }
      Toast(error.message);
    }
  };

  const onClickNotOneSelf = () => {
    history.replace('/pages/prescription/information/index', { id });
  };

  return (
    <View className={s.wrapper}>
      <Toast.Component />
      <View className={s.main}>
        <View className={s.title}>确认身份信息</View>
        <View className={s.subtitle}>为保证信息真实有效，请确认以下信息归属人</View>
        <View className={s.fields}>
          <View className={s.field}>
            <View className={s.label}>姓名</View>
            <View className={s.value}>{userinfo?.name || ''}</View>
          </View>
          <View className={s.field}>
            <View className={s.label}>身份证号</View>
            <View className={s.value}>{dataMasking(userinfo?.idCardNumber || '', 6, 4)}</View>
          </View>
        </View>
      </View>
      <View className={s.actions}>
        <Button
          color={LINEAR_GRADIENT_PRIMARY}
          round
          block
          customClass={s.button}
          bindclick={onClickOneSelf}
        >
          是我本人
        </Button>
        <Button type='default' round block customClass={s.button} bindclick={onClickNotOneSelf}>
          不是本人
        </Button>
      </View>
    </View>
  );
};
