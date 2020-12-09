import classnames from 'classnames';
import * as React from 'react';
import { useQuery } from 'remax';
import { VariableSizeList, areEqual } from 'remax-virtual-list';
import { unstable_batchedUpdates } from 'remax/runtime';
import {
    createSelectorQuery, GenericEvent, Input, ScrollView, setNavigationBarTitle, Swiper, SwiperItem,
    View
} from 'remax/wechat';

import ArticleItem from '@/components/article-item';
import { ARTICLE_SEARCH_PLACEHOLDER } from '@/constants/message';
import PAGE from '@/constants/page';
import { useRequest, useShareMessage, useVirtualList } from '@/hooks';
import useSetState from '@/hooks/useSetState';
import { ArticleService } from '@/services';
import {
    Article, ArticleCategory, ArticleGetListParams, ArticleList
} from '@/services/article/index.types';
import { isArray, isDefine } from '@/utils';
import history, { createURL } from '@/utils/history';
import Skeleton from '@vant/weapp/lib/skeleton';
import Tab from '@vant/weapp/lib/tab';
import Tabs from '@vant/weapp/lib/tabs';

import s from './index.less';

interface HeaderProps {
  className?: string;
  onSearch?: (value: string) => void;
  onClear?: () => void;
}

// 公共头部
const Header: React.FC<HeaderProps> = ({ className, children, onSearch, onClear }) => {
  const [state, setState] = useSetState({
    value: '',
  });

  const onInput = (event: GenericEvent<{ value: string }>) => {
    setState({ value: event.detail.value });
  };

  const onConfirm = () => {
    onSearch && onSearch(state.value);
  };

  const handleClear = () => {
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
        />
        <View className={classnames(s.clear, { [s.hidden]: !state.value })} onClick={handleClear} />
      </View>
      {children}
    </View>
  );
};

const ArticleItemComponent: React.FC<{
  style: React.CSSProperties;
  data: Article;
  setSize: (size: number) => any;
}> = React.memo(({ style, data, setSize }) => {
  const { id, title, picture, category, doctor, date, like, likes, shares } = data;
  const elementId = `article_${id}`;

  React.useEffect(() => {
    // createSelectorQuery()
    //   .select(`#${elementId}`)
    //   .boundingClientRect((element) => {
    //     console.log(element);
    //     element && setSize(element.height);
    //   })
    //   .exec();
  }, []);

  return (
    <ArticleItem
      id={elementId}
      style={style}
      articleId={id}
      title={title}
      picture={picture}
      label={category?.name}
      date={date}
      description={[doctor?.name, doctor?.hospitalName]}
      like={like}
      likes={likes}
      shares={shares}
    />
  );
}, areEqual);

const CustomArticleList: React.FC<{ data?: Article[],visible?:boolean }> = ({ data = [],visible }) => {
  const [itemSizes, setItemSizes] = React.useState<{ [key: number]: number }>({});

  const setItemSize = React.useCallback(
    (index) => (size: number) => setItemSizes((sizes) => ({ ...sizes, [index]: size })),
    [],
  );

  const getItemSize = React.useCallback((index) => itemSizes[index] || 200 - 46, [itemSizes]);


  return (
    <VariableSizeList width='100%' height={500} itemCount={data.length} itemSize={getItemSize} overscanCount={10} >
      {visible ? ({ index, style }) => (
        <ArticleItemComponent style={style} data={data[index]} setSize={setItemSize(index)} />
      ): () => <></>}
    </VariableSizeList>
  );
};

interface CustomArticleListState extends ArticleList {
  loaded: boolean;
}

const CustomArticleListWrapper = () => {
  const { categoryId } = useQuery();

  const keyword = React.useRef('');
  const [active, setActive] = React.useState<number | undefined>();
  const [loaded, setLoaded] = React.useState(false);
  const [categories, setCategories] = React.useState<ArticleCategory[]>([]);
  const [state, setState] = useSetState<{ [key: number]: CustomArticleListState }>({});

  const { run, fetches } = useRequest(
    async (params) => {
      const { categories: cs = [], list, pagination } = await ArticleService.getList({
        ...params,
        keyword: keyword.current,
      });

      const id = params.categoryId - 0;

      const firstIndex = cs?.findIndex((category) => id === category.id);

      const article = state[id] || [];

      state[id] = {
        ...article,
        list: pagination.current === 1 ? list : list.concat(article.list || []),
        pagination,
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
    if (!isDefine(active)) return;
    const category = categories[active];
    category && run({ categoryId: category.id, page: 1 });
  }, [active]);

  const onSearch = (value: string) => {
    keyword.current = value;
  };

  const onClear = () => {
    keyword.current = '';
  };

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
          className={s.content}
          current={active}
          onChange={({ detail }) => detail.source === 'touch' && setActive(detail.current)}
        >
          {categories.map(({ id }, index) => (
            <SwiperItem key={id}>
              {state[id]?.loaded ? (
                <CustomArticleList data={state[id]?.list} visible={index === active} />
              ) : (
                <ArticleItem.Loader size={5} />
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
          <ArticleItem.Loader size={5} />
        </View>
      </View>
    );
  }

  return (
    <>
      <Header onSearch={onSearch} onClear={onClear} />
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
