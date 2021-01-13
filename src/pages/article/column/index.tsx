import * as React from 'react';
import { useQuery } from 'remax';
import { View } from 'remax/wechat';

import ArticleItem from '@/components/article-item';
import Empty from '@/components/empty';
import { MESSAGE } from '@/constants';
import PAGE from '@/constants/page';
import { useRequest } from '@/hooks';
import { DoctorService } from '@/services';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';

export default () => {
  const { doctorId } = useQuery<{ doctorId: string }>();
  const { data, error, loading, run } = useRequest(async () => {
    const response = await DoctorService.query(doctorId);
    return { ...response, loaded: true };
  });

  if (data?.loaded) {
    const { articles } = data;
    return (
      <>
        {articles && articles.length ? (
          <>
            {articles.map(
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
          </>
        ) : (
          <Empty image='record' description='暂无文章' local />
        )}
      </>
    );
  } else if (error) {
    return (
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
    return <ArticleItem.Loader size={5} />;
  }

  return <></>;
};
