import classnames from 'classnames';
import * as React from 'react';
import { useQuery } from 'remax';
import { areEqual, FixedSizeList, VariableSizeList } from 'remax-virtual-list';
import { unstable_batchedUpdates, usePageInstance } from 'remax/runtime';
import {
  createIntersectionObserver,
  createSelectorQuery,
  GenericEvent,
  Input,
  nextTick,
  ScrollView,
  ScrollViewProps,
  setNavigationBarTitle,
  Swiper,
  SwiperItem,
  View,
} from 'remax/wechat';

import ArticleItem from '@/components/article-item';
import { ARTICLE_SEARCH_PLACEHOLDER } from '@/constants/message';
import PAGE from '@/constants/page';
import { useRequest, useShareMessage, useUpdateEffect, useVirtualList } from '@/hooks';
import useDebounceFn from '@/hooks/useDebounceFn';
import useSetState from '@/hooks/useSetState';
import useThrottleFn from '@/hooks/useThrottleFn';
import { ArticleService } from '@/services';
import {
  Article,
  ArticleCategory,
  ArticleGetListParams,
  ArticleList,
} from '@/services/article/index.types';
import { isArray, isDefine } from '@/utils';
import history, { createURL } from '@/utils/history';
import Loading from '@vant/weapp/lib/loading';
import Divider from '@vant/weapp/lib/Divider';
import Skeleton from '@vant/weapp/lib/skeleton';
import Tab from '@vant/weapp/lib/tab';
import Tabs from '@vant/weapp/lib/tabs';

import s from './index.less';
import Empty from '@/components/empty';
import fetch from '@/utils/fetch';

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
}> = React.memo(({ style, data }) => {
  const { id, title, picture, category, doctor, date, like, likes, shares } = data;

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
    />
  );
}, areEqual);

const ChunkList: React.FC<{ chunkId: string; observeHeight?: number }> = React.memo(
  ({ chunkId, observeHeight, children }) => {
    const instance = usePageInstance();
    const observer = React.useRef(createIntersectionObserver(instance));
    const chunkPrefix = React.useRef(Math.random().toString(36).slice(-8));
    const [state, setState] = useSetState({ height: 0, visible: true });

    const init = () => {
      if (!observer.current) return;
      observer.current
        .relativeToViewport({ top: observeHeight, bottom: observeHeight })
        .observe(
          `#${chunkPrefix.current}_${chunkId}`,
          ({ intersectionRatio, boundingClientRect }) => {
            if (intersectionRatio === 0) {
              setState({ visible: false });
              return;
            }
            setState({ height: boundingClientRect.height, visible: true });
          },
        );
    };

    React.useEffect(() => {
      nextTick(init);
    }, []);

    return (
      <View id={`${chunkPrefix.current}_${chunkId}`} style={{ minHeight: state.height + 'PX' }}>
        {state.visible && children}
      </View>
    );
  },
);

ChunkList.defaultProps = {
  observeHeight: 156 * 3,
};

export default () => {
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
        size: 6,
      });

      const id = params.categoryId - 0;

      const STATE = state[id] || {};

      state[id] = {
        ...STATE,
        keyword,
        completed: pagination.current * pagination.pageSize >= pagination.total,
        loaded: true,
      };

      nextTick(() => {
        unstable_batchedUpdates(() => {
          setState(state);
          setCategories(cs);

          const ARTICLES = articles[id];
          if (pagination.current === 1) {
            setArticles({ [id]: list && list.length ? [list] : [] });
          } else {
            list && list.length && setArticles({ [id]: [...ARTICLES, list] });
          }

          if (!loaded) {
            setLoaded(true);
          }
        });
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
    const article = state[active];

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
    [fetches, refresherTriggereds],
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
      if (fetch?.loading) return;

      const [params = {}] = fetch?.params || [];
      const page = params.page || 1;

      nextTick(() => {
        run({ categoryId: id, page: page + 1 });
      });
    },
    [fetches],
  );

  let content;

  if (loaded) {
    content = (
      <>
        {/* <Tabs
          customClass={s.tabs}
          active={active}
          ellipsis={false}
          lineWidth={12}
          lineHeight={3}
          bindclick={({ detail }) => onChangeActive(detail.index)}
        >
          {categories.map(({ id, name }) => (
            <Tab key={`tab_${id}`} title={name} />
          ))}
        </Tabs> */}
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
            <SwiperItem key={`swiper_${id}`} skipHiddenItemLayout>
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
                    <>
                      {articles[id].map((items, index) => (
                        <ChunkList key={`chunk_${id}_${index}`} chunkId={`${id}_${index}`}>
                          {items.map((item) => (
                            <ArticleItemComponent key={`${index}_${item.id}`} data={item} />
                          ))}
                        </ChunkList>
                      ))}
                      <View className={s.loadable}>
                        {state[id]?.completed ? (
                          <>没有更多了</>
                        ) : (
                          <Loading size={14}>正在获取数据</Loading>
                        )}
                      </View>
                    </>
                  ) : (
                    <Empty
                      image='record'
                      description={
                        fetches[id]?.loading ? (
                          <Loading size={14}>正在获取数据</Loading>
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
