import classnames from 'classnames';
import qs from 'qs';
import * as React from 'react';
import { useQuery } from 'remax';
import { usePageEvent } from 'remax/macro';
import { Image, requestSubscribeMessage, showModal, Text, View } from 'remax/wechat';

import Empty from '@/components/empty';
import Toast from '@/components/toast';
import { MESSAGE } from '@/constants';
import PAGE from '@/constants/page';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { DoctorService, SubscribeService } from '@/services';
import { SUBSCRIBE_MESSAGE_TEMPLATE_TYPE } from '@/services/subscribe/index.types.d';
import { isPlainObject, isString, noop } from '@/utils';
import { AuthorizeError, ServerError } from '@/utils/error';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';
import Skeleton from '@vant/weapp/lib/skeleton';

import s from './index.less';

const ADDED_ERROR_CODE = 5118672;
const SERVER_ERRO_CODE = 51186003;

export default () => {
  // 页面数据加载状态
  const [loaded, setLoaded] = React.useState(false);
  const query = useQuery<{ doctorId: string; q: string }>();

  // 获取订阅消息模板
  const { data: templateIds, run: getSubscribeMessageTemplateList } = useRequest(
    () => SubscribeService.query(SUBSCRIBE_MESSAGE_TEMPLATE_TYPE.ADD_MY_DOCTOR),
    {
      manual: true,
      onError: noop,
    },
  );

  const { data, error, loading, run } = useRequest(DoctorService.query, {
    manual: true,
    onSuccess() {
      loaded && getSubscribeMessageTemplateList();
      setLoaded(true);
    },
  });

  // 订阅消息
  const handleSubscribeMessage = React.useCallback(async () => {
    if (!templateIds) return;

    return requestSubscribeMessage({
      tmplIds: templateIds,
    }).catch(noop);
  }, [templateIds]);

  const { run: submit, loading: submitting } = useRequest(
    (params) => DoctorService.addMyDoctor(params),
    {
      manual: true,
      async onSuccess() {
        Toast.success('添加成功');
        await handleSubscribeMessage();
        history.push(PAGE.MY_DOCTOR);
      },
      onError(error: any) {
        if (AuthorizeError.is(error)) {
          return history.push(PAGE.AUTHORIZE);
        }

        if (ServerError.is(error) && error.response?.data?.code === ADDED_ERROR_CODE) {
          Toast.clear();
          showModal({
            content: `已添加过该医生，请至我的医生查看并进行沟通`,
            showCancel: true,
            confirmText: '去查看',
            cancelText: '知道了',
            success: async ({ confirm }) => {
              confirm && history.push(PAGE.MY_DOCTOR);
            },
          });

          return;
        }
        Toast(error.message);
      },
    },
  );

  const init = () => {
    let id = query.doctorId;
    if (query.q) {
      const [, querystring] = decodeURIComponent(query.q).split('?');
      const { doctorid: doctorId } = qs.parse(querystring);
      isString(doctorId) && (id = doctorId);
    }
    if (!id) {
      setLoaded(true);
      return;
    }
    run(id);
  };

  React.useEffect(init, []);
  usePageEvent('onShow', getSubscribeMessageTemplateList);

  if (loaded) {
    return isPlainObject(data) ? (
      <>
        <Toast.Component />
        <View className={s.card}>
          <View className={s.content}>
            <Image className={s.avatar} src={data?.avatar} lazyLoad />
            <View>
              <View className={s.title}>{data?.name}</View>
              <View className={s.subtitle}>{data?.officer}</View>
            </View>
          </View>
          <View className={s.fields}>
            <View className={s.field}>
              <Text>医院</Text>
              {data?.hospitalName}
            </View>
            <View className={s.field}>
              <Text>科室</Text>
              {data?.departmentName}
            </View>
            <View className={s.field}>
              <Text>所在地区</Text>
              {data?.address}
            </View>
          </View>
        </View>
        <Button
          color={LINEAR_GRADIENT_PRIMARY}
          customClass={s.submit}
          loading={submitting}
          disabled={submitting}
          bindclick={() => submit(data)}
          round
          block
        >
          添加为我的医生
        </Button>
      </>
    ) : (
      <Empty
        image='scan'
        description={
          <>
            <View>该二维码无法识别</View>
            <View>请扫描医生提供的二维码</View>
          </>
        }
        local
      />
    );
  } else if (error && ServerError.is(error) && error.response?.data?.code === SERVER_ERRO_CODE) {
    return (
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
          bindclick={init}
          loading={loading}
          disabled={loading}
          round
        >
          {MESSAGE.RETRY}
        </Button>
      </Empty>
    );
  } else {
    return (
      <View className={classnames(s.card, s.loader)}>
        <View className={s.content}>
          <Skeleton
            row={2}
            rowWidth={['35%', '50%']}
            avatar
            avatarShape='square'
            avatarSize='56px'
            loading
          />
        </View>
        <View className={s.fields}>
          <Skeleton row={3} loading />
        </View>
      </View>
    );
  }

  return <></>;
};
