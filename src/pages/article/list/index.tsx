import classnames from 'classnames';
import * as React from 'react';
import { useQuery } from 'remax';
import { unstable_batchedUpdates } from 'remax/runtime';
import {
  GenericEvent,
  Input,
  nextTick,
  ScrollView,
  setNavigationBarTitle,
  Swiper,
  SwiperItem,
  View,
} from 'remax/wechat';

import ArticleItem from '@/components/article-item';
import { ARTICLE_SEARCH_PLACEHOLDER, GETTING_DATA, NO_MORE } from '@/constants/message';
import PAGE from '@/constants/page';
import { useRequest, useShareMessage, useUpdateEffect } from '@/hooks';
import useSetState from '@/hooks/useSetState';
import { ArticleService } from '@/services';
import { Article, ArticleCategory } from '@/services/article/index.types';
import { isArray, isDefine } from '@/utils';
import history, { createURL } from '@/utils/history';
import Loading from '@vant/weapp/lib/loading';
import Skeleton from '@vant/weapp/lib/skeleton';
import Empty from '@/components/empty';
import s from './index.less';
import Popover from '@/components/popover';
import SafeArea from '@/components/safe-area';
import ChunkList from '@/components/chunk-list';

interface HeaderProps {
  className?: string;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  loading?: boolean;
}

// 公共头部
const Header: React.FC<HeaderProps> = ({
  className,
  children,
  onSearch,
  onClear,
  disabled,
  loading,
}) => {
  const [state, setState] = useSetState({
    value: '',
  });

  const onInput = (event: GenericEvent<{ value: string }>) => {
    setState({ value: event.detail.value });
  };

  const onConfirm = () => {
    if (loading || disabled) return;
    onSearch && onSearch(state.value);
  };

  const handleClear = () => {
    if (loading || disabled) return;
    setState({ value: '' });
    onClear && onClear();
  };

  return (
    <View className={classnames(s.header, { [`${className}`]: !!className })}>
      <View className={s.search}>
        <Input
          value={state.value}
          placeholder={ARTICLE_SEARCH_PLACEHOLDER}
          placeholderClassName='input-placeholder'
          onInput={onInput}
          onConfirm={onConfirm}
          disabled={disabled}
        />
        {!(loading || disabled) && (
          <View
            className={classnames(s.clear, { [s.hidden]: !state.value })}
            onClick={handleClear}
          />
        )}
        {loading && <Loading customClass={s.searching} size={14} />}
      </View>
      {children}
    </View>
  );
};

const ArticleItemComponent: React.FC<{
  data: Article;
  showType?: boolean;
}> = ({ data, showType }) => {
  const { id, title, picture, category, doctor, date, like, likes, shares, type } = data;

  return (
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
      {...(showType ? { type } : {})}
    />
  );
};

const CUSTOM_PAGE_SIZE = 6;

const CustomList = () => {
  const query = useQuery();
  const [active, setActive] = React.useState<number>(0);
  const [loaded, setLoaded] = React.useState(false);
  const [keyword, setKeyword] = React.useState('');
  const [refresherTriggereds, setRefresherTriggereds] = useSetState<{ [key: number]: boolean }>({});
  const [categories, setCategories] = React.useState<ArticleCategory[]>([]);
  const [articles, setArticles] = useSetState<{ [key: number]: Article[][] }>({});
  const [state, setState] = useSetState<{ [key: number]: any }>({});
  const [submitting, setSubmitting] = React.useState(false);
  const { fetches, run } = useRequest(
    async (params) => {
      const { categories: cs = [], list, pagination } = await ArticleService.getList({
        ...params,
        keyword,
        size: CUSTOM_PAGE_SIZE,
      });

      const id = params.categoryId - 0;

      const STATE = state[id] || {};

      state[id] = {
        ...STATE,
        keyword,
        completed: pagination.current * CUSTOM_PAGE_SIZE >= pagination.total,
        loaded: true,
      };

      unstable_batchedUpdates(() => {
        setState(state);
        setCategories(cs);

        const ARTICLES = articles[id] || [];
        if (pagination.current === 1) {
          setArticles({ [id]: list && list.length ? [list] : [] });
        } else {
          list && list.length && setArticles({ [id]: [...ARTICLES, list] });
        }

        if (!loaded) {
          setLoaded(true);
        }
      });
    },
    { manual: true, fetchKey: (params = {}) => params.categoryId! },
  );

  React.useEffect(() => {
    const id = query.categoryId;
    if (!isDefine(id)) return;
    run({ categoryId: id });
  }, []);

  useUpdateEffect(() => {
    if (!isDefine(active)) return;
    const category = categories[active];
    setSubmitting(true);
    category &&
      run({ categoryId: category.id, page: 1 }).finally(() => {
        setSubmitting(false);
      });
  }, [keyword]);

  const onSearch = (value: string) => {
    setKeyword(value);
  };

  const onClear = () => {
    setKeyword('');
  };

  const onChangeActive = (index: number) => {
    nextTick(() => {
      setActive(index);
    });

    const category = categories[index];
    const article = state[category?.id];

    if (category && (!article || (article && article.keyword !== keyword))) {
      nextTick(() => {
        run({ categoryId: category.id, page: 1 });
      });
    }
  };

  const onRefresherPulling = React.useCallback(
    (id: number) => {
      if (fetches[id]?.loading || refresherTriggereds[id]) return;
      setRefresherTriggereds({ [id]: true });
    },
    [fetches, refresherTriggereds],
  );
  const onRefresherRefresh = React.useCallback(
    (id: number) => {
      if (!state[id]?.loaded && fetches[id]?.loading) return;
      run({ categoryId: id, page: 1 }).finally(() => setRefresherTriggereds({ [id]: false }));
    },
    [state, fetches, refresherTriggereds],
  );
  const onRefresherRestore = React.useCallback(
    (id: number) => {
      setRefresherTriggereds({ [id]: false });
    },
    [fetches, refresherTriggereds],
  );

  const onScrollToLower = React.useCallback(
    (id: number) => {
      const fetch = fetches[id];
      if (fetch?.loading || state[id]?.completed) return;

      const [params = {}] = fetch?.params || [];
      const page = params.page || 1;

      nextTick(() => {
        run({ categoryId: id, page: page + 1 });
      });
    },
    [state, fetches],
  );

  let content;

  if (loaded) {
    content = (
      <>
        <View className={s.tabs}>
          {categories.map(({ id, name }, index) => (
            <View
              key={`tab_${id}`}
              className={classnames(s.tab, { [s.active]: index === active })}
              onClick={() => onChangeActive(index)}
            >
              <View>{name}</View>
            </View>
          ))}
        </View>
        <Swiper
          className={s.content}
          current={active}
          onChange={({ detail }) => detail.source === 'touch' && onChangeActive(detail.current)}
        >
          {categories.map(({ id }) => (
            <SwiperItem key={`swiper_${id}`}>
              {state[id]?.loaded ? (
                <ScrollView
                  className={s.container}
                  onRefresherPulling={() => onRefresherPulling(id)}
                  onRefresherRefresh={() => onRefresherRefresh(id)}
                  onRefresherRestore={() => onRefresherRestore(id)}
                  onRefresherAbort={() => onRefresherRestore(id)}
                  onScrollToLower={() => onScrollToLower(id)}
                  refresherTriggered={refresherTriggereds[id]}
                  refresherEnabled
                  scrollY
                >
                  {isArray(articles[id]) && articles[id].length > 0 ? (
                    <View>
                      {articles[id].map((items, index) => (
                        <ChunkList
                          key={`chunk_${id}_${index}`}
                          chunkId={`${id}_${index}`}
                          observeHeight={156 * 3}
                        >
                          {items.map((item) => (
                            <ArticleItemComponent key={`${index}_${item.id}`} data={item} />
                          ))}
                        </ChunkList>
                      ))}
                      <View className={s.loadable}>
                        {state[id]?.completed ? (
                          <>{NO_MORE}</>
                        ) : (
                          <Loading size={14}>{GETTING_DATA}</Loading>
                        )}
                      </View>
                      <SafeArea />
                    </View>
                  ) : (
                    <Empty
                      image='record'
                      description={
                        fetches[id]?.loading ? (
                          <Loading size={14}>{GETTING_DATA}</Loading>
                        ) : state[id]?.keyword ? (
                          `未找到“${state[id]?.keyword}”的相关文章`
                        ) : (
                          '暂无文章'
                        )
                      }
                      local
                    />
                  )}
                </ScrollView>
              ) : (
                <ArticleItem.Loader size={6} />
              )}
            </SwiperItem>
          ))}
        </Swiper>
      </>
    );
  } else {
    content = (
      <View className={s.loader}>
        <View className={s.tabs}>
          <Skeleton row={4} rowWidth='65px' loading />
        </View>
        <View>
          <ArticleItem.Loader size={6} />
        </View>
      </View>
    );
  }

  return (
    <View className={s.wrapper}>
      <Header
        onSearch={onSearch}
        onClear={onClear}
        loading={submitting}
        disabled={!loaded || submitting}
      />
      {content}
    </View>
  );
};

const SPECIAL_PAGE_SIZE = 10;

const FILTERS = [
  {
    label: '全部',
    icon: 'all',
  },
  {
    value: 'COMMON',
    label: '文章',
    icon: 'article',
  },
  {
    value: 'PAPER',
    label: '论文',
    icon: 'thesis',
  },
];

const SpecialList = () => {
  const [visible, setVisible] = React.useState(false);
  const [type, setType] = React.useState<string | undefined>();
  const [keyword, setKeyword] = React.useState('');
  const [refresherTriggered, setRefresherTriggered] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [articles, setArticles] = React.useState<Article[]>([]);

  const { data, loading, run, params } = useRequest(
    async (params?) => {
      const { list, pagination } = await ArticleService.getSpecialList({
        ...params,
        type,
        keyword,
      });

      setArticles(pagination.current === 1 ? list : [...articles, ...list]);

      return {
        keyword: keyword,
        loaded: true,
        completed: pagination.current * SPECIAL_PAGE_SIZE >= pagination.total,
      };
    },
    { manual: true },
  );

  const { loaded, completed } = data || {};

  React.useEffect(() => {
    run();
  }, []);

  useUpdateEffect(() => {
    setSubmitting(true);
    run({ page: 1 }).finally(() => {
      setSubmitting(false);
    });
  }, [keyword]);

  useUpdateEffect(() => {
    run({ page: 1 });
  }, [type]);

  const onSearch = (value: string) => {
    setKeyword(value);
  };

  const onClear = () => {
    setKeyword('');
  };

  const onClickFilter = (value: string | undefined) => {
    if (value === type) {
      return setVisible(false);
    }
    unstable_batchedUpdates(() => {
      setType(value);
      setVisible(false);
    });
  };

  const onRefresherPulling = React.useCallback(() => {
    if (loading || refresherTriggered) return;
    setRefresherTriggered(true);
  }, [loading, refresherTriggered]);
  const onRefresherRefresh = React.useCallback(() => {
    if (!loaded && loading) return;
    run({ page: 1 }).finally(() => setRefresherTriggered(false));
  }, [loaded, loading, refresherTriggered]);

  const onRefresherRestore = React.useCallback(() => {
    setRefresherTriggered(false);
  }, [loading, refresherTriggered]);

  const onScrollToLower = React.useCallback(() => {
    if (loading || completed) return;
    const [p = {}] = params || [];
    const page = p.page || 1;
    run({ page: page + 1 });
  }, [params, loading, completed]);

  let content;

  if (loaded) {
    content = (
      <View className={s.content}>
        <ScrollView
          className={s.container}
          onRefresherPulling={onRefresherPulling}
          onRefresherRefresh={onRefresherRefresh}
          onRefresherRestore={onRefresherRestore}
          onScrollToLower={onScrollToLower}
          onRefresherAbort={onRefresherRestore}
          refresherTriggered={refresherTriggered}
          refresherEnabled
          scrollY
        >
          {isArray(articles) && articles.length > 0 ? (
            <>
              {articles.map((article, index) => (
                <ArticleItemComponent key={`${index}_${article.id}`} data={article} showType />
              ))}

              <View className={s.loadable}>
                {completed ? <>{NO_MORE}</> : <Loading size={14}>{GETTING_DATA}</Loading>}
              </View>
              <SafeArea />
            </>
          ) : (
            <Empty
              image='record'
              description={
                loading ? (
                  <Loading size={14}>{GETTING_DATA}</Loading>
                ) : data?.keyword ? (
                  `未找到“${data?.keyword}”的相关文章`
                ) : (
                  '暂无文章'
                )
              }
              local
            />
          )}
        </ScrollView>
      </View>
    );
  } else {
    content = (
      <View className={s.loader}>
        <ArticleItem.Loader size={6} />
      </View>
    );
  }

  return (
    <>
      <View className={s.wrapper}>
        <Header
          className={s.special}
          onSearch={onSearch}
          onClear={onClear}
          loading={submitting}
          disabled={!loaded || submitting}
        >
          <Popover
            visible={visible}
            overlay={FILTERS.map(({ icon, value, label }, index) => (
              <Popover.Item
                key={index}
                className={classnames({ ['selected']: value === type })}
                onClick={() => onClickFilter(value)}
              >
                <View className={classnames(s.icon, s[icon])} />
                {label}
              </Popover.Item>
            ))}
            onClickMask={() => setVisible(false)}
            mask
          >
            <View
              className={classnames(s.filter, { [s.active]: visible, [s.selected]: !!type })}
              hoverClassName='clickable-opacity'
              hoverStayTime={0}
              onClick={() => loaded && setVisible(true)}
            >
              筛选
            </View>
          </Popover>
        </Header>
        {content}
      </View>
    </>
  );
};

export default () => {
  const { type } = useQuery();

  // 健康科普
  const isSpecial = type === 'special';

  React.useEffect(() => {
    setNavigationBarTitle({ title: isSpecial ? '健康科普' : '文章' });
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

  return <View className={s.wrapper}>{isSpecial ? <SpecialList /> : <CustomList />}</View>;
};
