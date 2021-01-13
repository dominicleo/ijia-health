import classnames from 'classnames';
import * as React from 'react';
import { usePageEvent } from 'remax/macro';
import { unstable_batchedUpdates } from 'remax/runtime';
import { hideShareMenu, showModal, Text, View } from 'remax/wechat';

import ArticleItem from '@/components/article-item';
import Empty from '@/components/empty';
import Loadable from '@/components/loadable';
import SafeArea from '@/components/safe-area';
import { MESSAGE } from '@/constants';
import PAGE from '@/constants/page';
import { LINEAR_GRADIENT_PRIMARY, LINEAR_GRADIENT_WARNING } from '@/constants/theme';
import { useRequest, useShareMessage } from '@/hooks';
import { ArticleService } from '@/services';
import { Article, ArticleId } from '@/services/article/index.types';
import { uniqueBySet } from '@/utils';
import history, { createURL } from '@/utils/history';
import Button from '@vant/weapp/lib/button';

import s from './index.less';

const PAGE_SIZE = 10;

export default () => {
  const [editable, setEditable] = React.useState(false);
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [selectedArticleIds, setSelectedArticleIds] = React.useState<ArticleId[]>([]);
  const { data, error, loading, run, params } = useRequest(
    async (params?) => {
      const { list, pagination } = await ArticleService.getBookmarkList(params);

      unstable_batchedUpdates(() => {
        editable && setEditable(false);
        setArticles(pagination.current === 1 ? list : [...articles, ...list]);
      });

      return { loaded: true, completed: pagination.current * PAGE_SIZE >= pagination.total };
    },
    { manual: true },
  );

  const query = () => run({ page: 1 });

  const { run: remove, loading: removing } = useRequest(
    () => ArticleService.removeBookmarkList(selectedArticleIds),
    {
      manual: true,
      onSuccess: query,
    },
  );

  React.useEffect(() => {
    hideShareMenu();
    query();
  }, []);

  usePageEvent('onReachBottom', () => {
    if (data?.loaded || data?.completed || loading || removing) return;

    const [p = {}] = params || [];
    const page = p.page || 1;
    run({ page: page + 1 });
  });

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

  const onClick = (id: ArticleId) => {
    if (loading || removing || !editable) return;
    if (selectedArticleIds.includes(id)) {
      setSelectedArticleIds(selectedArticleIds.filter((articleId) => articleId != id));
      return;
    }
    setSelectedArticleIds(uniqueBySet([...selectedArticleIds, id]));
  };

  const onClickDelete = async () => {
    if (removing) return;
    const { cancel } = await showModal({
      content: `确定删除${selectedArticleIds.length}条收藏吗？`,
    });
    if (cancel) return;
    remove();
  };

  if (data?.loaded) {
    return (
      <View className={classnames(s.wrapper, { [s.editable]: editable })}>
        {articles.length > 0 ? (
          <>
            <View className={s.edit}>
              <Button
                bindclick={() => setEditable(true)}
                color={LINEAR_GRADIENT_PRIMARY}
                icon='edit'
                round
                block
              >
                编辑
              </Button>
            </View>
            <View className={s.toolbar}>
              <Button
                bindclick={() => setEditable(false)}
                customClass={classnames(s.button, s.cancel)}
                color={LINEAR_GRADIENT_WARNING}
                round
                block
              >
                取消
              </Button>
              <Button
                bindclick={onClickDelete}
                disabled={!selectedArticleIds.length || removing}
                customClass={classnames(s.button, s.delete)}
                color={LINEAR_GRADIENT_PRIMARY}
                loading={removing}
                round
                block
              >
                删除选中（<Text>{selectedArticleIds.length}</Text>）
              </Button>
            </View>
            {articles.map(
              ({ type, id, title, picture, category, date, doctor, like, likes, shares }) => (
                <View
                  key={id}
                  onClick={() => onClick(id)}
                  className={classnames(s.article, {
                    [s.selected]: selectedArticleIds.includes(id),
                  })}
                >
                  <ArticleItem
                    id={id}
                    title={title}
                    picture={picture}
                    label={category?.name}
                    date={date}
                    description={[doctor?.name, doctor?.hospitalName]}
                    like={like}
                    likes={likes}
                    shares={shares}
                    onClick={() => history.push(PAGE.ARTICLE, { articleId: id })}
                    {...(category?.special ? { type } : {})}
                  />
                </View>
              ),
            )}
            <Loadable loading={!data.completed} />
            <SafeArea />
          </>
        ) : (
          <Empty image='record' description='你暂无收藏哦' />
        )}
      </View>
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
      >
        <Button
          type='primary'
          size='small'
          bindclick={query}
          loading={loading}
          disabled={loading}
          round
        >
          {MESSAGE.RETRY}
        </Button>
      </Empty>
    );
  } else {
    return <ArticleItem.Loader size={6} />;
  }

  return <></>;
};
