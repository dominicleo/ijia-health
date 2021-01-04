import s from './index.less';

import * as React from 'react';
import { Image, View } from 'remax/wechat';

import { NimRecord } from '@/utils/im';

import ChatingRecordWrapper from '../wrapper';
import Ellipsis from '@/components/ellipsis';
import history from '@/utils/history';
import PAGE from '@/constants/page';
import defaultImage from './images/icon-article.svg';

const ChatingRecordArticle: React.FC<NimRecord> = React.memo((props) => {
  const { content } = props;
  const { id, title: label, content: title, thumbnail } = content?.data || {};

  return (
    <View
      className={s.article}
      onClick={() => history.push(PAGE.ARTICLE, { articleId: id })}
      hoverClassName='clickable'
    >
      <View className={s.content}>
        <Ellipsis className={s.title} rows={2}>
          {title}
        </Ellipsis>
        <Image
          className={s.picture}
          src={thumbnail && thumbnail !== 'null' ? thumbnail : defaultImage}
          lazyLoad
        />
      </View>
      <View className={s.footer}>{label}</View>
    </View>
  );
});

export default ChatingRecordWrapper({ children: ChatingRecordArticle });
