import * as React from 'react';
import { showModal, TouchEvent, View } from 'remax/wechat';

import { MESSAGE } from '@/constants';
import PAGE from '@/constants/page';
import { useRequest } from '@/hooks';
import { DoctorService } from '@/services';
import { Doctor } from '@/services/doctor/index.types';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';

import ArticleContext from '../context';
import ArticleDoctor from '../doctor';
import './index.less';

const ArticleDoctorCard: React.FC<{ id?: string; data: Doctor }> = React.memo(({ id, data }) => {
  const { follow } = data;
  const { mutate } = React.useContext(ArticleContext);
  const { run, loading } = useRequest(
    () => (follow ? DoctorService.unfollow(data.id) : DoctorService.follow(data)),
    {
      manual: true,
      loadingDelay: 200,
      onSuccess() {
        mutate((state) => ({ ...state, doctor: { ...data, follow: !follow } }));
      },
    },
  );

  const onClick = async (event: TouchEvent) => {
    // @ts-ignore
    event.stopPropagation();
    if (loading) return;
    if (follow) {
      const { cancel } = await showModal({
        title: MESSAGE.SYSTEM_PROMPT,
        content: '确认不再关注?',
      });
      if (cancel) return;
    }
    run();
  };

  return (
    <View
      id={id}
      className='doctorcard'
      hoverClassName='clickable'
      hoverStayTime={0}
      onClick={() => history.push(PAGE.DOCTOR, { doctorId: data.id })}
    >
      <ArticleDoctor data={data} />
      <View onClick={onClick} hoverStopPropagation>
        <Button
          icon={follow ? '' : 'plus'}
          type={follow ? 'default' : 'primary'}
          size='small'
          loading={loading}
          disabled={loading}
          round
        >
          {follow && '已'}关注
        </Button>
      </View>
    </View>
  );
});

export default ArticleDoctorCard;
