import * as React from 'react';
import { useQuery } from 'remax';
import { usePageEvent } from 'remax/macro';
import { getStorageSync, getSystemInfoSync, Text, View } from 'remax/wechat';

import Toast from '@/components/toast';
import { STORAGE } from '@/constants';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { PrescribeService } from '@/services';
import { isArray, isPlainObject } from '@/utils';
import history from '@/utils/history';
import { operate } from '@/utils/number';
import Button from '@vant/weapp/lib/button';
import Icon from '@vant/weapp/lib/icon';
import Tab from '@vant/weapp/lib/tab';
import Tabs from '@vant/weapp/lib/tabs';

import s from './index.module.less';

const TABS = [
  { key: 1, title: '到店取药' },
  { key: 2, title: '快递寄件' },
];

interface ShippingAddress {
  name: string;
  mobile: number | string;
  address: string;
}

export default () => {
  const { id } = useQuery<{ id: string }>();
  const pharmacy = getStorageSync(STORAGE.PHARMACY) || {};
  const [shippingAddress, setShippingAddress] = React.useState<ShippingAddress | null>(null);
  // 当前 TAB 索引
  const [tabIndex, setTabIndex] = React.useState(0);
  const onChangeTabIndex = (index: number) => {
    setTabIndex(index);
  };
  const { safeArea } = getSystemInfoSync();
  const safeAreaHeight = safeArea.bottom - safeArea.height;

  const [loaded, setPageCompleted] = React.useState<boolean>(false);

  const { data } = useRequest(
    async () => {
      const [response, addressList] = await Promise.all([
        PrescribeService.query(id),
        PrescribeService.getAllAddressList(),
      ]);
      addressList.forEach((item) => {
        if (item.isDefault) {
          setShippingAddress({
            address: item.areaName + item.street,
            name: item.accepter,
            mobile: item.mobile,
          });
        }
      });
      return response;
    },
    {
      onSuccess(response) {
        !loaded && setPageCompleted(true);
      },
    },
  );

  const { run: confirm, loading } = useRequest((params) => PrescribeService.confirm(params), {
    manual: true,
    onSuccess() {
      history.replace('/pages/prescribe/payment/index', { id });
    },
  });

  usePageEvent('onShow', () => {
    const address = getStorageSync(STORAGE.SHIPPING_ADDRESS);
    if (isPlainObject(address)) {
      setShippingAddress({
        address: address.areaName + address.street,
        name: address.accepter,
        mobile: address.mobile,
      });
    }
  });

  const { doctorStoreDtos: store, prescriptionDrugs: drugs, stateOrigin } = data?.source || {};

  const onConfirm = () => {
    if (stateOrigin == 1) {
      history.replace('/pages/prescribe/payment/index', { id });
      return;
    }
    if (loading) return;
    if (!isPlainObject(pharmacy)) {
      Toast('缺少药店信息');
      return;
    }
    if (tabIndex === 1 && !shippingAddress) {
      Toast('请完善地址信息');
      return;
    }
    confirm({
      address: shippingAddress?.address,
      logisticsFee: 0,
      patientMobile: shippingAddress?.mobile || data.patientMobile,
      patientName: shippingAddress?.name || data.patientName,
      prescriptionId: id,
      storeId: pharmacy.id || store.storeId,
      type: TABS[tabIndex].key,
    });
  };

  const renderTotalPrice = () => {
    const items = isArray(pharmacy?.medicineDTOList) ? pharmacy?.medicineDTOList : drugs;
    return isArray(items)
      ? items.reduce((total: number, current: any) => operate(total, current.price, '+'), 0)
      : 0;
  };

  const rennderCount = () => {
    const items = isArray(pharmacy?.medicineDTOList) ? pharmacy?.medicineDTOList : drugs;
    return isArray(items)
      ? items.reduce((total: number, current: any) => operate(total, current.count, '+'), 0)
      : 0;
  };

  const getTabs = () => {
    if (pharmacy.type == 0) return TABS;
    return TABS.filter(({ key }) => key !== 2);
  };

  return (
    <View className={s.wrapper}>
      <Toast.Component />
      <Tabs
        active={tabIndex}
        bindchange={(event: any) => onChangeTabIndex(event.detail.index)}
        ellipsis={false}
        swipeable
        custom-class={s.articles}
        animated
        border={false}
        line-width={8}
        line-height={4}
      >
        {getTabs().map((item: any) => (
          <Tab key={item.key} title={item.title}>
            {tabIndex === 0 && (
              <View className={s.card}>
                <View className={s.pharmacy}>
                  <View className={s.title}>药房地址</View>
                  <View className={s.address}>
                    <View className={s.detailed}>{pharmacy.address || store?.storeAddress}</View>
                    <View className={s.contact}>
                      <Text>{pharmacy.name || store?.storeName}</Text>
                      <Text>{pharmacy.mobile || store?.storeMobile}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}
            {tabIndex === 1 && (
              <View className={s.card}>
                <View className={s.pharmacy}>
                  <View className={s.title}>我的地址</View>
                  <View
                    className={s.details}
                    onTap={() => history.push('/pages/prescribe/delivery-address/list/index')}
                  >
                    <View className={s.address}>
                      <View className={s.detailed}>
                        {shippingAddress ? shippingAddress?.address : '暂无具体地址信息'}
                      </View>
                      <View className={s.contact}>
                        <Text>{shippingAddress?.name}</Text>
                        <Text>{shippingAddress?.mobile}</Text>
                      </View>
                    </View>
                    <Icon name='arrow' />
                  </View>
                </View>
              </View>
            )}
            <View className={s.card}>
              <View className={s.pharmacyName}>{pharmacy?.name || store?.storeName}</View>
              <View className={s.prescriptionList}>
                {isArray(pharmacy?.medicineDTOList)
                  ? pharmacy?.medicineDTOList.map((item: any) => (
                      <View key={item.id} className={s.prescriptionItem}>
                        <View
                          className={s.picture}
                          style={item.cover ? { backgroundImage: `url(${item.cover})` } : {}}
                        />
                        <View>
                          <View className={s.name}>
                            <Text>{item.commonName || item.name}</Text>
                            <Text className={s.amount}>￥{item.price}</Text>
                          </View>
                          <View className={s.brief}>
                            <Text>
                              {item.drugName} {item.specName}
                            </Text>
                            <Text>
                              *{item.count}
                              {item.unit}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))
                  : isArray(drugs) &&
                    drugs.map((drug: any) => (
                      <View key={drug.drugId} className={s.prescriptionItem}>
                        <View
                          className={s.picture}
                          style={drug.imageUrl ? { backgroundImage: `url(${drug.imageUrl})` } : {}}
                        />
                        <View>
                          <View className={s.name}>
                            <Text>{drug.drugName}</Text>
                            <Text className={s.amount}>￥{drug.price}</Text>
                          </View>
                          <View className={s.brief}>
                            <Text>
                              {drug.frequency} {drug.usaged}
                            </Text>
                            <Text>
                              *{drug.count}
                              {drug.useAmountUnit}
                            </Text>
                          </View>
                        </View>
                      </View>
                    ))}
              </View>
            </View>
          </Tab>
        ))}
      </Tabs>
      <View className={s.toolbar} style={{ paddingTop: safeAreaHeight + 'PX' }}>
        <View
          className={s.toolbarInner}
          style={safeAreaHeight > 0 ? { paddingBottom: safeAreaHeight + 'PX' } : {}}
        >
          <View>
            <View className={s.amount}>
              <View className={s.quantityed}>合计:</View>
              <View className={s.value}>￥{renderTotalPrice()}</View>
              {/* <View className={s.unit}>共{rennderCount()}件&nbsp;含快递费0元</View> */}
            </View>
            {/* <View className={s.quantity}>合计金额</View> */}
            <View className={s.united}>
              共{rennderCount()}件{tabIndex === 1 ? <Text> &nbsp;含快递费0元</Text> : null}
            </View>
          </View>
          <Button
            color={LINEAR_GRADIENT_PRIMARY}
            custom-class={s.btn}
            round
            bindclick={onConfirm}
            loading={loading}
          >
            支付
          </Button>
        </View>
      </View>
    </View>
  );
};
