import * as React from 'react';
import { View } from 'remax/wechat';

import ArticleItem from '@/components/article-item';
import PAGE from '@/constants/page';
import { Article } from '@/services/article/index.types';
import history from '@/utils/history';

import Headline from '../headline';
import s from './index.less';

const ArticleRecommend: React.FC<{ data: Article[] }> = React.memo(({ data }) => {
  return (
    <View className={s.recommend}>
      <Headline title='文章推荐' />
      <View className={s.articles}>
        {data.map(({ id, type, title, picture, category, date, like, likes, shares }) => (
          <ArticleItem
            key={`article_${id}`}
            {...(category?.special ? { type: type } : { label: category?.name })}
            id={id}
            title={title}
            picture={picture}
            like={like}
            likes={likes}
            shares={shares}
            date={date}
            onClick={() => history.replace(PAGE.ARTICLE, { articleId: id })}
          />
        ))}
      </View>
    </View>
  );
});

export default ArticleRecommend;
