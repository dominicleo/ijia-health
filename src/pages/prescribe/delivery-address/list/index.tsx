import * as React from 'react';
import { usePageEvent } from 'remax/macro';
import { getSystemInfoSync, ScrollView, setStorage, Text, View } from 'remax/wechat';

import Empty from '@/components/empty';
import { STORAGE } from '@/constants';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { PrescribeService } from '@/services';
import { isArray } from '@/utils';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';

import s from './index.module.less';

const DEFAULT_PARAMS = {
  page: 1,
  pageSize: 1000,
};

export default () => {
  const { data, run, error, loading } = useRequest(
    () => PrescribeService.getAddressList({ ...DEFAULT_PARAMS }),
    {
      manual: true,
      onSuccess() {
        // Toast.hide();
      },
    },
  );
  usePageEvent('onShow', () => {
    run();
  });

  /** 安全区 */
  const { safeArea } = getSystemInfoSync();
  const safeAreaHeight = safeArea.bottom - safeArea.height;

  const selectAddress = (event: any, item: any) => {
    setStorage({ key: STORAGE.SHIPPING_ADDRESS, data: item });
    history.back();
  };

  let content: any;
  if (isArray(data) && data.length) {
    content = data.map((item, index) => {
      return (
        <View className={s.adressList} key={index}>
          <View
            className={s.selectAdre}
            onTap={(event) => {
              selectAddress(event, item);
            }}
          >
            <View className={s.adressTitle}>
              <Text className={s.userName}>{item.accepter}</Text>
              <Text>{item.mobile}</Text>
              {item.isDefault ? <Text className={s.adressDefault}>默认</Text> : null}
            </View>
            <View className={s.adres}>{`${item.areaName}${item.street}`}</View>
          </View>
          <View
            className={s.backimg}
            wechat-hoverClass='clickable'
            onTap={() =>
              history.push('/pages/prescribe/delivery-address/index', {
                addressId: item.addressId,
              })
            }
          >
            <View className={s.adressEditor}></View>
          </View>
        </View>
      );
    });
  } else {
    content = <Empty image='message' local />;
  }

  return (
    <View className={s.header}>
      <ScrollView scrollY>
        <View>
          {content}
          <View className={s.toolbarBlank} style={{ paddingBottom: safeAreaHeight }} />
        </View>
      </ScrollView>
      <View className={s.button}>
        <Button
          customClass={s.btn}
          icon='plus'
          round
          block
          color={LINEAR_GRADIENT_PRIMARY}
          customStyle={{ bottom: safeAreaHeight }}
          bindclick={() => history.push('/pages/prescribe/delivery-address/index')}
        >
          新建收货地址
        </Button>
      </View>
    </View>
  );
};
