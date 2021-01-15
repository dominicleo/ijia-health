import * as React from 'react';
import { useQuery } from 'remax';
import { Text, View } from 'remax/wechat';
import { getSystemInfoSync, makePhoneCall, showModal } from 'remax/wechat';

import Empty from '@/components/empty';
import Toast from '@/components/toast';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { PrescribeService, PrescriptionService } from '@/services';
import { isArray, isNativeCancel } from '@/utils';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';
import Skeleton from '@vant/weapp/lib/skeleton';

import s from './index.module.less';

export default () => {
  const { id } = useQuery<{ id: string }>();
  const { safeArea } = getSystemInfoSync();
  const safeAreaHeight = safeArea.bottom - safeArea.height;
  // 页面数据加载状态
  const [loaded, setPageCompleted] = React.useState(false);
  const { data, error, run, loading } = useRequest(() => PrescriptionService.query(id), {
    onSuccess() {
      !loaded && setPageCompleted(true);
    },
  });

  if (error) {
    return (
      <Empty image='record' description={error.message}>
        <Button
          type='primary'
          size='small'
          bindclick={run}
          loading={loading}
          disabled={loading}
          round
        >
          重新加载
        </Button>
      </Empty>
    );
  }

  if (!loaded) {
    return (
      <View className={s.wrapper}>
        <View className={s.card}>
          <Skeleton title row={16} />
        </View>
      </View>
    );
  }

  const { store, price = 0, pharmacy, drugs } = data || {};

  const onClickCustomer = () => {
    makePhoneCall({ phoneNumber: store.telephone }).catch((error) => {
      if (isNativeCancel(error)) return;
      Toast('呼叫失败，请重试');
    });
  };

  const onPayment = () =>
    PrescribeService.checkOrderIsPay(id).then((response) => {
      if (!response) {
        showModal({
          title: '提示',
          content: '已超过支付有效期。请联系医生重新开方。',
          showCancel: false,
        });
        return;
      }
      history.replace('/pages/prescription/payment/index', { id, price });
    });

  const count = drugs?.length
    ? drugs.reduce((total: number, current: any) => total + current.count, 0)
    : 0;

  return (
    <View className={s.wrapper}>
      {isArray(pharmacy) && pharmacy?.length > 0 && (
        <View className={s.card}>
          {pharmacy.map((store) => (
            <View key={store.id} className={s.pharmacy}>
              <View className={s.title}>药房地址</View>
              <View className={s.address}>
                <View className={s.detailed}>{store.address}</View>
                <View className={s.contact} onTap={onClickCustomer}>
                  <Text>{store.name}</Text>
                  <Text>{store.telephone}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {isArray(pharmacy) &&
        pharmacy?.length > 0 &&
        pharmacy.map((store: any) => (
          <View key={store.id} className={s.card}>
            <View className={s.pharmacyName}>{store?.name}</View>
            <View className={s.prescriptionList}>
              {isArray(store?.drugs) &&
                store?.drugs.map((item: any) => (
                  <View key={item.id} className={s.prescriptionItem}>
                    <View
                      className={s.picture}
                      style={item.picture ? { backgroundImage: `url(${item.picture})` } : {}}
                    />
                    <View>
                      <View className={s.name}>
                        <Text>{item.commonName || item.name}</Text>
                        <Text className={s.amount}>￥{item.price}</Text>
                      </View>
                      <View className={s.brief}>
                        <Text>{item.instructions}</Text>
                        <Text>
                          *{item.count}
                          {item.unit}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        ))}

      <View className={s.toolbar} style={{ paddingTop: safeAreaHeight + 'PX' }}>
        <View
          className={s.toolbarInner}
          style={safeAreaHeight > 0 ? { paddingBottom: safeAreaHeight + 'PX' } : {}}
        >
          <View>
            <View className={s.amount}>
              <View className={s.value}>￥{price}</View>
              <View className={s.unit}>共{count}件</View>
            </View>
            <View className={s.quantity}>合计金额</View>
          </View>
          <Button color={LINEAR_GRADIENT_PRIMARY} size='small' round bindclick={onPayment}>
            支付
          </Button>
        </View>
      </View>
    </View>
  );
};
