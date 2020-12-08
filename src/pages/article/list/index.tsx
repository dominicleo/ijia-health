import classnames from 'classnames';
import * as React from 'react';
import { useNativeEffect } from 'remax';
import { GenericEvent, Input, setNavigationBarTitle, View } from 'remax/wechat';

import { useQuery, useRequest, useUpdateEffect } from '@/hooks';
import useSetState from '@/hooks/useSetState';
import { ArticleService } from '@/services';
import { ArticleGetListParams } from '@/services/article/index.types';
import { isDefine } from '@/utils';

import s from './index.less';

interface ArticleListHeaderProps {
  onSearch?: (value: string) => void;
  onClear?: () => void;
}

// 公共头部
const ArticleListHeader: React.FC<ArticleListHeaderProps> = ({ children, onSearch, onClear }) => {
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
    <View className={s.header}>
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

const DEFAULT_PARAMS = {};

// 文章列表
const ArticleList = () => {
  const { categoryId, a } = useQuery();

  const params = React.useRef<ArticleGetListParams>({});
  const { data, loading, run } = useRequest(() => ArticleService.getList(params.current), {
    manual: true,
  });

  useUpdateEffect(() => {
    run();
  }, [params]);

  useNativeEffect(() => {
    if (isDefine(categoryId)) return;
    params.current.categoryId = categoryId;
    run();
  }, []);

  const onSearch = (keyword: string) => {
    console.log('onSearch', keyword);
  };

  return (
    <>
      <ArticleListHeader onSearch={onSearch} onClear={() => onSearch('')} />
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
      <ArticleListHeader onSearch={onSearch} onClear={() => onSearch('')}>
        <View className={s.filter} hoverClassName='clickable-opacity' hoverStayTime={0}>
          筛选
        </View>
      </ArticleListHeader>
    </>
  );
};

export default () => {
  const { type, categoryId } = useQuery();

  // 健康科普
  const isSpecial = type === 'special';

  React.useEffect(() => {
    setNavigationBarTitle({ title: isSpecial ? '健康科普' : '文章' });
  }, []);

  return <View className={s.wrapper}>{isSpecial ? <SpecialArticleList /> : <ArticleList />}</View>;
};
