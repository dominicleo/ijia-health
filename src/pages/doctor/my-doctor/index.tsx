import classnames from 'classnames';
import * as React from 'react';
import { usePageEvent } from 'remax/macro';
import { Image, showModal, Text, View } from 'remax/wechat';

import Empty from '@/components/empty';
import Loadable from '@/components/loadable';
import Toast from '@/components/toast';
import { MESSAGE } from '@/constants';
import PAGE from '@/constants/page';
import { LINEAR_GRADIENT_WARNING } from '@/constants/theme';
import YunxinContainer from '@/containers/im';
import { useRequest } from '@/hooks';
import { DoctorService, UserService } from '@/services';
import { Doctor } from '@/services/doctor/index.types';
import date from '@/utils/date';
import { AuthorizeError } from '@/utils/error';
import history from '@/utils/history';
import Yunxin, { NIM_SCENE } from '@/utils/im';
import Button from '@vant/weapp/lib/button';
import Skeleton from '@vant/weapp/lib/skeleton';

import s from './index.less';

const DEFAULT_SIZE = 10;

export default () => {
  const [list, setList] = React.useState<Doctor[]>([]);
  const { data, error, loading, run, params } = useRequest(
    async (params?) => {
      const response = await DoctorService.getMyDoctorList(params);
      !params?.page || params?.page === 1 ? setList(response) : setList(list.concat(response));
      return { loaded: true, completed: response?.length < DEFAULT_SIZE };
    },
    { manual: true },
  );

  const query = () => run({ page: 1 });

  const { run: remove, fetches } = useRequest(DoctorService.removeMyDoctor, {
    manual: true,
    fetchKey: (id) => String(id),
    onSuccess() {
      Toast.success('移除成功');
      query();
    },
  });

  usePageEvent('onShow', query);

  usePageEvent('onReachBottom', () => {
    if (!data?.loaded || loading || data?.completed) return;
    const [p = {}] = params || [];
    const page = p.page || 1;
    run({ page: page + 1 });
  });

  const onRemove = async (id: number) => {
    if (fetches[id]?.loading) return;
    const { cancel } = await showModal({
      title: MESSAGE.SYSTEM_PROMPT,
      content: '删除后，您将无法随时与医生进行沟通，确定删除吗?',
    });
    if (cancel) return;
    remove(id);
  };

  const onClickConsult = async (account: string) => {
    try {
      Toast.loading({ duration: 0 });
      const isRealname = await UserService.isRealname();
      if (!isRealname) {
        Toast.clear();
        const { confirm } = await showModal({
          title: MESSAGE.SYSTEM_PROMPT,
          content: '当前服务需要您进行实名认证，请前往实名认证页面进行校验',
          confirmText: '立即前往',
        });
        confirm && history.push(PAGE.CERTIFICATION);
        return;
      }

      // 初始化云信
      await Yunxin.init(false);

      const scene = NIM_SCENE.P2P;
      const sessionId = [scene, account].join('-');
      // 设置当前会话
      await YunxinContainer.setSessionId(sessionId);

      history.push(PAGE.CHATING, { sessionId, account, scene });

      Toast.clear();
    } catch (error) {
      if (AuthorizeError.is(error)) {
        Toast.clear();
        history.push(PAGE.AUTHORIZE);
        return;
      }
      Toast(error.message);
    }
  };

  let content;

  if (data?.loaded) {
    content = list.length ? (
      <>
        <View>
          {list.map(
            ({
              sourceId,
              id,
              account,
              name,
              avatar,
              officer,
              hospitalName,
              departmentName,
              address,
              createdAt,
            }) => (
              <View
                className={s.card}
                key={sourceId}
                onClick={() => history.push(PAGE.DOCTOR, { doctorId: id })}
                hoverClassName='clickable'
              >
                <View className={s.header}>
                  <View className={s.hospitalName}>{hospitalName}</View>
                  <View
                    className={s.trash}
                    onClick={(event) => {
                      // @ts-ignore
                      event.stopPropagation();
                      onRemove(sourceId);
                    }}
                    hoverStopPropagation
                  />
                </View>
                <View className={s.body}>
                  <Image className={s.avatar} src={avatar} lazyLoad />
                  <View className={s.content}>
                    <View className={s.name}>{name}</View>
                    <View className={s.details}>
                      <Text>{officer}</Text>
                      <Text>{departmentName}</Text>
                    </View>
                    <View className={s.address}>{address}</View>
                  </View>
                </View>
                <View className={s.footer}>
                  <View className={s.date}>添加时间：{date(createdAt).format('L')}</View>
                  <View
                    onClick={(event) => {
                      // @ts-ignore
                      event.stopPropagation();
                      onClickConsult(account);
                    }}
                    hoverStopPropagation
                  >
                    <Button
                      color={LINEAR_GRADIENT_WARNING}
                      size='small'
                      disabled={fetches[id]?.loading}
                      loading={fetches[id]?.loading}
                      round
                    >
                      立即咨询
                    </Button>
                  </View>
                </View>
              </View>
            ),
          )}
        </View>
        <Loadable loading={!data?.completed} />
      </>
    ) : (
      <Empty
        description={
          <>
            <View>您可以扫描门诊医生向您展示的二维码</View>
            <View>把它添加为我的专属医生</View>
          </>
        }
      >
        <Button type='primary' size='small' bindclick={() => history.back()} round>
          {MESSAGE.GOT_IT}
        </Button>
      </Empty>
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
    content = Array.from(Array(3).keys()).map((_, index) => (
      <View className={classnames(s.card, s.loader)} key={index}>
        <View className={s.header}>
          <View>
            <Skeleton title titleWidth='25%' loading />
          </View>
        </View>
        <View className={s.body}>
          <Skeleton avatar avatarSize='72px' avatarShape='square' loading />
          <View className={s.content}>
            <Skeleton row={3} rowWidth={['15%', '50%', '35%']} loading />
          </View>
        </View>
        <View className={s.footer}>
          <View>
            <Skeleton title loading />
          </View>
        </View>
      </View>
    ));
  }

  return (
    <View className={s.wrapper}>
      <Toast.Component />
      {content}
    </View>
  );
};
