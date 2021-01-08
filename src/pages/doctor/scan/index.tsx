import qs from 'qs';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { DoctorService, SubscribeService } from '@/services';
import Button from '@vant/weapp/lib/button';
import * as React from 'react';
import { useQuery } from 'remax';
import { Image, nextTick, Text, View } from 'remax/wechat';

import s from './index.less';
import { isString, noop } from '@/utils';
import { MESSAGE } from '@/constants';
import Empty from '@/components/empty';
import { SUBSCRIBE_MESSAGE_TEMPLATE_TYPE } from '@/services/subscribe/index.types.d';
import { usePageEvent } from 'remax/macro';
import { ServerError, ServiceError } from '@/utils/error';
import Skeleton from '@vant/weapp/lib/skeleton';
import classnames from 'classnames';

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
    return (
      <>
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
        <Button color={LINEAR_GRADIENT_PRIMARY} customClass={s.submit} round block>
          添加为我的医生
        </Button>
      </>
    );
  } else if (error && ServiceError.is(error) && error.code === 51186003) {
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
