import { MESSAGE } from '@/constants';
import { DOCTOR_SEARCH_PLACEHOLDER } from '@/constants/message';
import history from '@/utils/history';
import * as React from 'react';
import { Input, ScrollView, View } from 'remax/wechat';

import s from './index.less';

export default () => {
  const onSearch = (value: string) => {};

  return (
    <View className={s.wrapper}>
      <View className={s.header}>
        <View className={s.search}>
          <Input
            placeholder={DOCTOR_SEARCH_PLACEHOLDER}
            placeholderClassName='input-placeholder'
            onConfirm={(event) => onSearch(event.detail.value)}
            // disabled={disabled}
            autoFocus
          />
          {/* {loading && <Loading customClass={s.searching} size={14} />} */}
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
      <ScrollView className={s.content} scrollY>
        1
      </ScrollView>
    </View>
  );
};
