import classnames from 'classnames';
import * as React from 'react';
import { useQuery } from 'remax';
import { setClipboardData, Text, View } from 'remax/wechat';

import Empty from '@/components/empty';
import { useRequest } from '@/hooks';
import { PrescriptionService } from '@/services';
import { isArray } from '@/utils';
import date from '@/utils/date';
import Button from '@vant/weapp/lib/button';
import Skeleton from '@vant/weapp/lib/skeleton';

import s from './index.module.less';

export default () => {
  const { id } = useQuery<{ id: string }>();
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

  const {
    orderNumber,
    code,
    medicineCode,
    qrcode,
    price = 0,
    pharmacy,
    drugs,
    paymentTime,
    paymentType,
    used,
  } = data || {};

  const count = drugs.length
    ? drugs.reduce((total: number, current: any) => total + current.count, 0)
    : 0;

  const completeDrugs = drugs.filter(({ completeTime }: any) => completeTime);

  const qrcodeURL = medicineCode || qrcode;

  return (
    <View className={s.wrapper}>
      <View className={s.card}>
        {!used ? (
          <>
            <View
              className={s.qrcode}
              style={qrcodeURL ? { backgroundImage: `url(${qrcodeURL})` } : {}}
            />
            <View className={s.code}>
              <View>
                取药码：
                <Text>{code}</Text>
              </View>
              <Text>请7天内尽快取药</Text>
            </View>
          </>
        ) : (
          <View className={classnames(s.code, s.used)}>
            <View>
              取药码：
              <Text>{code}</Text>
            </View>
            <Text>{used ? '已使用' : '未使用'}</Text>
          </View>
        )}
      </View>

      {isArray(pharmacy) &&
        pharmacy?.length > 0 &&
        pharmacy.map((store) => (
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

      <View className={s.card}>
        <View className={s.total}>
          <View className={s.label}>
            药品实付款<Text>({count}件)</Text>
          </View>
          <View className={s.amount}>￥{price}</View>
        </View>
      </View>

      {isArray(pharmacy) && pharmacy?.length > 0 && (
        <View className={s.card}>
          <View className={s.fieldset}>
            <View className={s.title}>药店信息</View>
            {pharmacy.map((store) => (
              <View key={store.id} className={s.fields}>
                <View className={s.field}>
                  <View className={s.label}>药店名称</View>
                  <View className={s.value}>{store?.name}</View>
                </View>
                <View className={s.field}>
                  <View className={s.label}>药店地址</View>
                  <View className={s.value}>{store?.address}</View>
                </View>
                {store?.telephone && (
                  <View className={s.field}>
                    <View className={s.label}>药店电话</View>
                    <View className={s.value}>{store?.telephone}</View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={s.card}>
        <View className={s.fieldset}>
          <View className={s.title}>订单信息</View>
          <View className={s.fields}>
            {orderNumber && (
              <View className={s.field} onTap={() => setClipboardData({ data: orderNumber })}>
                <View className={s.label}>订单编号</View>
                <View className={s.value}>
                  <View className={s.copyable}>
                    <View className={s.copyValue}>{orderNumber}</View>
                    <View className={s.tag}>复制</View>
                  </View>
                </View>
              </View>
            )}
            {paymentType && (
              <View className={s.field}>
                <View className={s.label}>付款方式</View>
                <View className={s.value}>在线支付</View>
              </View>
            )}
            {paymentTime && (
              <View className={s.field}>
                <View className={s.label}>付款时间</View>
                <View className={s.value}>{date(paymentTime).format('L LTS')}</View>
              </View>
            )}
            {completeDrugs?.length > 0 && (
              <View className={s.field}>
                <View className={s.label}>取药时间</View>
                <View className={s.value}>
                  {completeDrugs.map((item: any) => (
                    <View key={item.id}>
                      {date(item.completeTime).format('L LTS')}（{item.storeName} {item.name}）
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};
