import classnames from 'classnames';
import * as React from 'react';
import { useQuery } from 'remax';
import { areEqual, FixedSizeList, VariableSizeList } from 'remax-virtual-list';
import { unstable_batchedUpdates } from 'remax/runtime';
import {
  createSelectorQuery,
  GenericEvent,
  Input,
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
  style?: React.CSSProperties;
}> = React.memo(({ style, data }) => {
  const { id, title, picture, category, doctor, date, like, likes, shares } = data;

  return (
    <ArticleItem
      id={id}
      className={s.article}
      style={style}
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

const CustomArticleList: React.FC<{
  height: number;
  data?: Article[];
  loaded?: boolean;
  loading?: boolean;
  visible?: boolean;
  scrollViewProps?: ScrollViewProps;
}> = ({ height, data = [], loaded, loading, visible, scrollViewProps }) => {
  const itemCount = data.length + 1;

  const render = React.useCallback(
    ({ style, index }) => {
      return visible ? <ArticleItemComponent style={style} data={data[index]} /> : <></>;
    },
    [data],
  );

  const loadingElement = React.useMemo(
    () => (loading ? <Loading size={14}>正在获取数据</Loading> : <>上滑加载更多</>),
    [loading],
  );

  const innerElementType: React.ForwardRefExoticComponent<any> = React.forwardRef(
    ({ style, children, ...rest }, ref) => (
      <View
        ref={ref}
        style={{
          ...style,
          height: parseFloat(style.height) + 50,
        }}
        {...rest}
      >
        {children}
        <View className={s.loadable} style={{ top: style.height }}>
          {loaded ? <>没有更多了</> : loadingElement}
        </View>
      </View>
    ),
  );

  return (
    <FixedSizeList
      width='100%'
      height={height}
      itemCount={data.length}
      itemSize={156}
      overscanCount={0}
      containerProps={scrollViewProps}
      innerElementType={innerElementType as any}
    >
      {render}
    </FixedSizeList>
  );
};

interface CustomArticleListState extends ArticleList {
  keyword?: string;
  loaded: boolean;
}

const CustomArticleListWrapper = () => {
  const { categoryId } = useQuery();

  const [keyword, setKeyword] = React.useState('');
  const [active, setActive] = React.useState<number | undefined>();
  const [loaded, setLoaded] = React.useState(false);
  const [categories, setCategories] = React.useState<ArticleCategory[]>([]);
  const [state, setState] = useSetState<{ [key: number]: CustomArticleListState }>({});
  const [contentHeight, setContentHeight] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);

  const { run, fetches } = useRequest(
    async (params) => {
      const { categories: cs = [], list, pagination } = await ArticleService.getList({
        ...params,
        keyword,
      });

      const id = params.categoryId - 0;

      const firstIndex = cs?.findIndex((category) => id === category.id);

      const article = state[id] || {};

      state[id] = {
        ...article,
        list: pagination.current === 1 ? list : (article.list || []).concat(list),
        pagination,
        keyword,
        loaded: true,
      };

      unstable_batchedUpdates(() => {
        setState(state);
        setCategories(cs);

        if (!loaded) {
          setLoaded(true);
          isDefine(firstIndex) && setActive(firstIndex);
        }
      });
    },
    {
      manual: true,
      fetchKey: (params = {}) => params.categoryId!,
    },
  );

  React.useEffect(() => {
    if (!isDefine(categoryId)) return;
    run({ categoryId });
  }, []);

  React.useEffect(() => {
    if (!loaded || contentHeight) return;
    createSelectorQuery()
      .select('#content')
      .boundingClientRect((element) => element && setContentHeight(element.height))
      .exec();
  }, [loaded]);

  React.useEffect(() => {
    if (!isDefine(active)) return;
    const category = categories[active];
    const article = state[category.id];
    if (category && (!article || (article && article.keyword !== keyword))) {
      run({ categoryId: category.id, page: 1 });
    }
  }, [active]);

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

  const onScrollToLower = React.useCallback(
    (id: number) => {
      const fetch = fetches[id];
      if (fetch?.loading) return;

      const [params = {}] = fetch?.params || [];
      const page = params.page || 1;

      run({ categoryId: id, page: page + 1 });
    },
    [fetches],
  );

  let content;

  if (loaded) {
    content = (
      <>
        <Tabs
          customClass={s.tabs}
          active={active}
          ellipsis={false}
          lineWidth={12}
          lineHeight={3}
          bindclick={({ detail }) => setActive(detail.index)}
          animated
          sticky
        >
          {categories.map(({ id, name }) => (
            <Tab key={`tab_${id}`} title={name} />
          ))}
        </Tabs>
        <Swiper
          id='content'
          className={s.content}
          current={active}
          onChange={({ detail }) => detail.source === 'touch' && setActive(detail.current)}
        >
          {categories.map(({ id }, index) => (
            <SwiperItem key={id}>
              {state[id]?.loaded ? (
                <CustomArticleList
                  height={contentHeight}
                  data={state[id]?.list}
                  loading={fetches[id]?.loading}
                  visible={index === active}
                  scrollViewProps={{
                    enableBackToTop: true,
                    onScrollToLower: () => onScrollToLower(id),
                  }}
                />
              ) : (
                index === active && <ArticleItem.Loader size={5} />
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
    <>
      <Header
        onSearch={onSearch}
        onClear={onClear}
        loading={submitting}
        disabled={!loaded || submitting}
      />
      {content}
    </>
  );
};

const SpecialArticleListWrapper = () => {
  return (
    <>
      <Header className={s.special} />
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

  return (
    <View className={s.wrapper}>
      {isSpecial ? <SpecialArticleListWrapper /> : <CustomArticleListWrapper />}
    </View>
  );
};
