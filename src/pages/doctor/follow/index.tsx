import * as React from 'react';
import { usePageEvent } from 'remax/runtime';
import { showModal, View } from 'remax/wechat';

import DoctorItem from '@/components/doctor-item';
import DoctorItemLoader from '@/components/doctor-item/loader';
import Empty from '@/components/empty';
import Loadable from '@/components/loadable';
import Toast from '@/components/toast';
import { MESSAGE } from '@/constants';
import PAGE from '@/constants/page';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { DoctorService } from '@/services';
import { Doctor } from '@/services/doctor/index.types';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';

import s from './index.less';
import { CONFIRM_UNFOLLOW } from '@/constants/message';

const DEFAULT_SIZE = 10;

export default () => {
  const [list, setList] = React.useState<Doctor[]>([]);
  const { data, error, loading, run, params } = useRequest(
    async (params?) => {
      const response = await DoctorService.getFollowList(params);
      const items = response.map((data) => ({ ...data, follow: true }));
      !params?.page || params?.page === 1 ? setList(items) : setList(list.concat(items));
      return { loaded: true, completed: items?.length < DEFAULT_SIZE };
    },
    { manual: true },
  );

  const { run: follow, fetches } = useRequest(
    (doctor: Doctor) =>
      doctor.follow ? DoctorService.unfollow(doctor.id) : DoctorService.follow(doctor),
    {
      manual: true,
      fetchKey: ({ id }) => String(id),
      onSuccess(_, [doctor]) {
        setList(
          list.map((item) =>
            item.id === doctor.id ? { ...doctor, follow: !doctor.follow } : item,
          ),
        );
      },
    },
  );

  const query = () => run({ page: 1 });

  usePageEvent('onShow', query);

  usePageEvent('onReachBottom', () => {
    if (!data?.loaded || loading || data?.completed) return;
    const [p = {}] = params || [];
    const page = p.page || 1;
    run({ page: page + 1 });
  });

  const onClickFollow = async (doctor: Doctor) => {
    if (fetches[doctor.id]?.loading) return;
    if (doctor.follow) {
      const { cancel } = await showModal({
        title: MESSAGE.SYSTEM_PROMPT,
        content: CONFIRM_UNFOLLOW,
      });
      if (cancel) return;
    }
    follow(doctor);
  };

  let content;

  if (data?.loaded) {
    content = (
      <>
        {list.length ? (
          <>
            <View>
              {list.map((item) => (
                <DoctorItem
                  {...item}
                  key={item.id}
                  onClick={() => history.push(PAGE.DOCTOR, { doctorId: item.id })}
                  extra={
                    <View
                      onClick={(event) => {
                        // @ts-ignore
                        event.stopPropagation();
                        onClickFollow(item);
                      }}
                    >
                      <Button
                        customClass={s.follow}
                        type={item.follow ? 'default' : undefined}
                        color={item.follow ? '' : LINEAR_GRADIENT_PRIMARY}
                        disabled={fetches[item.id]?.loading}
                        loading={fetches[item.id]?.loading}
                        loadingSize='12px'
                        size='small'
                        round
                      >
                        {item.follow && '已'}关注
                      </Button>
                    </View>
                  }
                />
              ))}
            </View>
            <Loadable loading={!data.completed} />
          </>
        ) : (
          <Empty image='record' description='你暂无关注哦' />
        )}
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
    content = <DoctorItemLoader size={7} />;
  }

  return (
    <View className={s.wrapper}>
      <Toast.Component />
      {content}
    </View>
  );
};
