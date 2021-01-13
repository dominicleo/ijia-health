import history, { createURL } from '@/utils/history';
import * as React from 'react';
import { RichText, ScrollView, showModal, Text, View } from 'remax/wechat';
import Navbar from '@vant/weapp/lib/nav-bar';

import s from './index.less';
import { useRequest, useShareMessage } from '@/hooks';
import { useQuery } from 'remax';
import { DoctorService } from '@/services';
import DoctorItem from '@/components/doctor-item';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import Button from '@vant/weapp/lib/button';
import { Doctor } from '@/services/doctor/index.types';
import { MESSAGE } from '@/constants';
import { CONFIRM_UNFOLLOW } from '@/constants/message';
import PAGE from '@/constants/page';
import Toast from '@/components/toast';
import html2json from '@/utils/html2json';
import ArticleItem from '@/components/article-item';
import Empty from '@/components/empty';

const EMPTY_TAG_REG = /<([a-z]+?)(?:\s+?[^>]*?)?>\s*?<\/\1>/gi;
const ARTICLE_MAX_SIZE = 3;

const isEmptyContent = (value?: string) => !value || EMPTY_TAG_REG.test(value);

const Card: React.FC<{ title: string; description?: string; extra?: React.ReactNode }> = ({
  title,
  description,
  extra,
  children,
}) => {
  return (
    <View className={s.card}>
      <View className={s.title}>
        <View className={s.headline}>{title}</View>
        {extra && <View className={s.extra}>{extra}</View>}
      </View>
      {description && (
        <View className={s.description}>
          <RichText nodes={html2json(description)} space='nbsp' />
        </View>
      )}
      {children}
    </View>
  );
};

export default () => {
  const { doctorId } = useQuery<{ doctorId: string }>();
  const { data, error, loading, run, mutate } = useRequest(
    async () => {
      const response = await DoctorService.query(doctorId);
      return { ...response, loaded: true };
    },
    { manual: true },
  );

  const { run: follow, loading: submitting } = useRequest(
    (doctor: Doctor) =>
      doctor.follow ? DoctorService.unfollow(doctor.id) : DoctorService.follow(doctor),
    {
      manual: true,
      fetchKey: ({ id }) => String(id),
      onSuccess(_, [doctor]) {
        const { follow, followNumber = 0 } = doctor;
        Toast(follow ? '取消关注成功' : '关注成功');
        mutate((state) => ({
          ...state,
          follow: !follow,
          followNumber: follow ? followNumber - 1 : followNumber + 1,
        }));
      },
    },
  );

  React.useEffect(() => {
    run();
  }, []);

  useShareMessage((event) => {
    const { from } = event;

    if (from === 'button') {
      const { id, title, picture } = event.target.dataset;
      return {
        title,
        path: createURL(PAGE.ARTICLE, { articleId: id }),
        imageUrl: picture,
      };
    }
    return {};
  });

  const onClickFollow = async (doctor: Doctor) => {
    if (submitting) return;
    if (doctor.follow) {
      const { cancel } = await showModal({
        title: MESSAGE.SYSTEM_PROMPT,
        content: CONFIRM_UNFOLLOW,
      });
      if (cancel) return;
    }
    follow(doctor);
  };

  let main;
  let content;

  if (data?.loaded) {
    const { avatar, follow, followNumber, specialty, introduce, articles } = data;
    const avatarStyle: React.CSSProperties = avatar ? { backgroundImage: `url(${avatar})` } : {};
    main = (
      <>
        <View className={s.avatar} style={avatarStyle} />
        <View className={s.action}>
          <Button
            bindclick={() => onClickFollow(data)}
            customClass={s.follow}
            type={follow ? 'default' : undefined}
            color={follow ? '' : LINEAR_GRADIENT_PRIMARY}
            disabled={submitting}
            loading={submitting}
            loadingSize='12px'
            size='small'
            round
          >
            {follow && '已'}关注
          </Button>
        </View>
        <DoctorItem
          {...data}
          showAvatar={false}
          extra={
            <View className={s.follow}>
              <Text>{followNumber}</Text>人关注TA
            </View>
          }
        />
      </>
    );

    content = (
      <>
        {!isEmptyContent(specialty) && <Card title='擅长学科' description={specialty} />}
        {!isEmptyContent(introduce) && <Card title='医师介绍' description={introduce} />}
        {articles && articles.length > 0 && (
          <Card
            title='专栏文章'
            extra={
              articles.length > ARTICLE_MAX_SIZE && (
                <View
                  className={s.more}
                  onClick={() => history.push(PAGE.ARTICLE_COLUMN__LIST, { doctorId })}
                >
                  {articles.length}篇
                </View>
              )
            }
          >
            <View className={s.article}>
              {articles
                .filter((_, index) => index < ARTICLE_MAX_SIZE)
                .map(
                  ({
                    id,
                    type,
                    title,
                    picture,
                    category,
                    doctor,
                    date: createdAt,
                    like,
                    likes,
                    shares,
                  }) => (
                    <ArticleItem
                      key={id}
                      id={id}
                      type={type}
                      title={title}
                      picture={picture}
                      label={category.name}
                      date={createdAt}
                      description={[doctor?.name, doctor?.hospitalName]}
                      like={like}
                      likes={likes}
                      shares={shares}
                      onClick={() => history.push(PAGE.ARTICLE, { articleId: id })}
                    />
                  ),
                )}
            </View>
          </Card>
        )}
      </>
    );
  } else if (error) {
    main = (
      <>
        <View className={s.avatar} />
        <View className={s.action} />
        <DoctorItem.Loader showAvatar={false} />
      </>
    );
    content = (
      <Empty
        image='record'
        description={
          <>
            {MESSAGE.REQUEST_FAILED}
            <View>{error.message}</View>
          </>
        }
        local
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
    main = (
      <>
        <View className={s.avatar} />
        <View className={s.action} />
        <DoctorItem.Loader showAvatar={false} />
      </>
    );
  }

  return (
    <View className={s.wrapper}>
      <Toast.Component />
      <View className={s.header}>
        <Navbar border={false}>
          <View slot='left'>
            <View className={s.back} onClick={() => history.back()} />
          </View>
        </Navbar>
      </View>
      <View className={s.main}>{main}</View>
      <ScrollView className={s.content} scrollY>
        {content}
      </ScrollView>
    </View>
  );
};
