import classnames from 'classnames';
import * as React from 'react';
import { useNativeEffect } from 'remax';
import { unstable_batchedUpdates } from 'remax/runtime';
import {
    GenericEvent, Input, ScrollView, setNavigationBarTitle, Swiper, SwiperItem, View
} from 'remax/wechat';

import ArticleItem from '@/components/article-item';
import PAGE from '@/constants/page';
import { useQuery, useRequest, useShareMessage, useUpdateEffect } from '@/hooks';
import useSetState from '@/hooks/useSetState';
import { ArticleService } from '@/services';
import { isArray, isDefine } from '@/utils';
import history, { createURL } from '@/utils/history';
import Tab from '@vant/weapp/lib/tab';
import Tabs from '@vant/weapp/lib/tabs';

import s from './index.less';

import type {
  Article,
  ArticleCategory,
  ArticleGetListParams,
  ArticleList as ArticleListProps,
} from '@/services/article/index.types';
interface ArticleListHeaderProps {
  className?: string;
  onSearch?: (value: string) => void;
  onClear?: () => void;
}

// 公共头部
const ArticleListHeader: React.FC<ArticleListHeaderProps> = ({
  className,
  children,
  onSearch,
  onClear,
}) => {
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
          placeholder='搜索文章标题或作者姓名'
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

const ArticleList: React.FC<{ data: Article[]; loading?: boolean }> = ({ data, loading }) => {
  let content;

  if (data && data.length) {
    content = data.map(
      ({ category, id, title, picture, date: createdAt, doctor, like, likes, shares }) => (
        <ArticleItem
          key={`article_${category.id}_${id}`}
          id={id}
          title={title}
          picture={picture}
          label={category.name}
          date={createdAt}
          like={like}
          likes={likes}
          shares={shares}
          description={[doctor?.name, doctor?.hospitalName]}
          onClick={() => history.push(PAGE.ARTICLE, { articleId: id })}
        />
      ),
    );
  } else {
    content = 'empty';
  }

  return <>{content}</>;
};

interface CustomState {
  category: ArticleCategory;
  list: Article[];
  pagination?: ArticleListProps['pagination'];
  loaded?: boolean;
}

// 文章列表
const CustomArticleList = () => {
  const { categoryId } = useQuery();

  // const [loaded, setLoaded] = React.useState<any>(false);
  // const [active, setActive] = React.useState<any>();
  // const [refresherTriggered, setRefresherTriggered] = useSetState<any>({});
  // const [params, setParams] = React.useState<ArticleGetListParams>({});
  // const [state, setState] = React.useState<CustomState[]>([]);

  // const { fetches, run } = useRequest(
  //   async (options) => {
  //     const { categories = [], list, pagination } = await ArticleService.getList(options);

  //     let firstIndex: number;
  //     const next = categories.map((item, index) => {
  //       const source = state.find(({ category }) => category.id === item.id) || {};
  //       const original = Object.assign({ list: [], category: item }, source);
  //       if (item.id === options.categoryId) {
  //         firstIndex = index;
  //         return {
  //           ...original,
  //           list: pagination?.current === 1 ? list : list.concat(original.list || []),
  //           pagination,
  //           loaded: true,
  //         };
  //       }

  //       return original;
  //     });

  //     unstable_batchedUpdates(() => {
  //       setState(next);
  //       if (!loaded) {
  //         setLoaded(true);
  //         isDefine(firstIndex) && setActive(firstIndex);
  //       }
  //     });

  //     return { loaded: true };
  //   },
  //   {
  //     manual: true,
  //     fetchKey: ({ categoryId: id }) => id,
  //   },
  // );

  // useUpdateEffect(() => {
  //   run(params);
  // }, [params]);

  // useNativeEffect(() => {
  //   if (!isDefine(categoryId)) return;
  //   setParams({ categoryId: parseInt(categoryId) });
  // }, []);

  // const onSearch = (keyword: string) => {
  //   console.log('onSearch', keyword);
  // };

  // const changeTab = (index: number) => {
  //   const tab = state[index];
  //   if (!tab) return;

  //   unstable_batchedUpdates(() => {
  //     setActive(index);
  //     !tab.loaded && tab.category && setParams({ categoryId: tab.category.id, page: 1 });
  //   });
  // };

  // const onRefresherPulling = (id: number) => {
  //   if (fetches[id]?.loading || refresherTriggered[id]) return;
  //   setRefresherTriggered({ [id]: true });
  // };

  // const onRefresherRefresh = (id: number) => {
  //   if (!fetches[id]?.data?.loaded || fetches[id]?.loading) return;
  //   run({ ...params, categoryId: id, page: 1 }).finally(() =>
  //     setRefresherTriggered({ [id]: false }),
  //   );
  // };

  // const onRefresherRestore = (id: number) => {
  //   setRefresherTriggered({ [id]: false });
  // };

  // const onScrollToLower = (id: number) => {
  //   if (!fetches[id]?.data?.loaded || fetches[id]?.loading) return;
  //   setParams({ ...params, page: params.page + 1 });
  // };

  // let content;

  // if (loaded) {
  //   content = (
  //     <>
  //       <View className={s.tabs}>
  //         <Tabs
  //           active={active}
  //           ellipsis={false}
  //           lineWidth={12}
  //           lineHeight={3}
  //           bindclick={({ detail }) => changeTab(detail.index)}
  //           animated
  //           sticky
  //         >
  //           {state.map(({ category: { id, name } }) => (
  //             <Tab key={`tab_${id}`} title={name} />
  //           ))}
  //         </Tabs>
  //       </View>
  //       <View className={s.main}>
  //         <Swiper
  //           className={s.content}
  //           current={active}
  //           onChange={({ detail }) => detail.source === 'touch' && changeTab(detail.current)}
  //           duration={200}
  //           easingFunction='linear'
  //         >
  //           {state.map(({ category: { id }, list, ...rest }) => (
  //             <SwiperItem key={`swiper_${id}`}>
  //               {!rest.loaded ? (
  //                 <ArticleItem.Loader size={5} />
  //               ) : (
  //                 <ScrollView
  //                   className={s.container}
  //                   onRefresherPulling={() => onRefresherPulling(id)}
  //                   onRefresherRefresh={() => onRefresherRefresh(id)}
  //                   onRefresherRestore={() => onRefresherRestore(id)}
  //                   onRefresherAbort={() => onRefresherRestore(id)}
  //                   onScrollToLower={() => onScrollToLower(id)}
  //                   refresherTriggered={refresherTriggered[id]}
  //                   refresherEnabled={rest.loaded}
  //                   scrollY
  //                 >
  //                   <ArticleList data={list} loading={fetches[id]?.loading} />
  //                 </ScrollView>
  //               )}
  //             </SwiperItem>
  //           ))}
  //         </Swiper>
  //       </View>
  //     </>
  //   );
  // } else if (fetches[params.categoryId!]?.error && !loaded) {
  //   content = 'error';
  // } else {
  //   content = 'loading';
  // }

  return (
    <>
      <ArticleListHeader onSearch={onSearch} onClear={() => onSearch('')} />
      {content}
    </>
  );
};

// 健康科普
const SpecialArticleList = () => {
  const onSearch = (keyword: string) => {
    console.log('onSearch', keyword);
  };

  return (
    <>
      <ArticleListHeader className={s.special} onSearch={onSearch} onClear={() => onSearch('')}>
        <View className={s.filter} hoverClassName='clickable-opacity' hoverStayTime={0}>
          筛选
        </View>
      </ArticleListHeader>
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
    <View className={s.wrapper}>{isSpecial ? <SpecialArticleList /> : <CustomArticleList />}</View>
  );
};
