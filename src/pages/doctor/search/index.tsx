import classnames from 'classnames';
import * as React from 'react';
import { unstable_batchedUpdates } from 'remax/runtime';
import { Input, ScrollView, showModal, TouchEvent, View } from 'remax/wechat';

import DoctorItem from '@/components/doctor-item';
import DoctorItemLoader from '@/components/doctor-item/loader';
import Empty from '@/components/empty';
import Loadable from '@/components/loadable';
import { DOCTOR_SEARCH_PLACEHOLDER } from '@/constants/message';
import PAGE from '@/constants/page';
import { HISTORY_SEARCH_KEYWORD } from '@/constants/storage';
import { useRequest, useStorageState } from '@/hooks';
import { DoctorService } from '@/services';
import { Doctor } from '@/services/doctor/index.types';
import { isArray, uniqueBySet } from '@/utils';
import history from '@/utils/history';
import Loading from '@vant/weapp/lib/loading';

import s from './index.less';

const KEYWORD_MAX_SIZE = 9;
const RETRY_TEXT = '请点击重新获取热门搜索';

const SearchRecord: React.FC<{
  title: string;
  data: string[];
  onSearch: (value: string) => void;
  onClear?: (event: TouchEvent) => void;
}> = ({ title, data = [], onSearch, onClear }) => {
  return (
    <>
      <View className={s.title}>
        {title}
        {onClear && (
          <View
            className={s.clear}
            onClick={onClear}
            hoverClassName='clickable-opacity'
            hoverStayTime={0}
          />
        )}
      </View>
      <View className={s.keywords}>
        {data.map((text) => (
          <View
            key={text}
            className={s.keyword}
            hoverClassName={s.clickable}
            hoverStayTime={0}
            onClick={onSearch && (() => onSearch(text))}
          >
            {text}
          </View>
        ))}
      </View>
    </>
  );
};

export default () => {
  const [mounted, setMounetd] = React.useState(false);
  const [value, setValue] = React.useState('');
  const [keywords = [], setKeywords] = useStorageState<string[]>(HISTORY_SEARCH_KEYWORD, []);
  const [visible, setVisible] = React.useState(true);
  const [doctors, setDoctors] = React.useState<Doctor[]>([]);

  const { data, loading, run, params } = useRequest(
    async (params?) => {
      const { list, pagination } = await DoctorService.getList(params);
      setDoctors(pagination.current === 1 ? list : [...doctors, ...list]);

      return {
        keyword: params.keyword,
        loaded: true,
        completed: pagination.current * pagination.pageSize >= pagination.total,
      };
    },
    {
      manual: true,
    },
  );

  const { data: hotKeywords, run: retry, loading: querying, error } = useRequest(
    DoctorService.keywords,
  );

  React.useEffect(() => {
    setMounetd(true);
  }, []);

  const onSearch = (value: string) => {
    const formatValue = value.replace(/(^\s+)|(\s+$)/g, '');
    if (loading || !formatValue) return;

    setVisible(false);
    run({ page: 1, keyword: formatValue }).then(() => {
      unstable_batchedUpdates(() => {
        setValue(formatValue);
        setKeywords(
          uniqueBySet(
            [formatValue, ...keywords].filter((_, index: number) => index < KEYWORD_MAX_SIZE),
          ),
        );
      });
    });
  };

  const onScrollToLower = () => {
    if (loading || data?.completed) return;
    const [p = {}] = params || [];
    const page = p.page || 1;
    run({ ...p, page: page + 1 });
  };

  const onClear = async () => {
    const { confirm } = await showModal({
      content: '一键清空所有搜索记录？',
      confirmText: '清空',
    });
    confirm && setKeywords([]);
  };

  let content;

  if (doctors.length) {
    content = (
      <ScrollView className={s.container} onScrollToLower={onScrollToLower} enableBackToTop scrollY>
        <View>
          {doctors.map((doctor) => (
            <DoctorItem
              key={doctor.id}
              onClick={() => history.push(PAGE.DOCTOR, { doctorId: doctor.id })}
              {...doctor}
            />
          ))}
        </View>
        <Loadable loading={!data?.completed} />
      </ScrollView>
    );
  } else if (data?.keyword) {
    content = <Empty image='search' description={`未找到“${data?.keyword}”的相关数据`} local />;
  } else if (loading && params[0]?.page === 1) {
    content = <DoctorItemLoader size={7} />;
  }

  let hoKeywordContent;

  if (isArray(hotKeywords) && hotKeywords.length > 0) {
    hoKeywordContent = <SearchRecord title='热门搜索' data={hotKeywords} onSearch={onSearch} />;
  } else if (error) {
    hoKeywordContent = (
      <View className={s.footer} onClick={retry}>
        {querying ? (
          <Loading type='circular' size={14}>
            {RETRY_TEXT}
          </Loading>
        ) : (
          RETRY_TEXT
        )}
      </View>
    );
  }

  return (
    <View className={s.wrapper}>
      <View className={s.header}>
        <View className={s.search}>
          <Input
            value={value}
            placeholder={DOCTOR_SEARCH_PLACEHOLDER}
            placeholderClassName={s.placeholder}
            onInput={(event) => setValue(event.detail.value)}
            onConfirm={(event) => onSearch(event.detail.value)}
            onFocus={() => setVisible(true)}
            disabled={loading}
            autoFocus={!mounted}
          />
          {loading && <Loading customClass={s.searching} type='circular' size={14} />}
        </View>
        <View
          className={s.cancel}
          onClick={() => history.back()}
          hoverClassName='clickable-opacity'
          hoverStayTime={0}
        >
          取消
        </View>
      </View>
      <View className={s.content}>
        <View className={classnames(s.record, { [s.hidden]: !visible })}>
          {keywords.length > 0 && (
            <SearchRecord title='最近搜索' data={keywords} onSearch={onSearch} onClear={onClear} />
          )}
          {hoKeywordContent}
        </View>
        {content}
      </View>
    </View>
  );
};
