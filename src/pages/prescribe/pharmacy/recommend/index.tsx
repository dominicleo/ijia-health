// import * as React from 'react';
// import { usePageEvent } from 'remax/macro';
// import { View, Text } from 'remax/one';
// import s from './index.module.less';
// import { useNativeEffect } from 'remax';

// export default () => {
//   return (
//     <>
//       <View className={s.wrapper}>
//         <View className={s.itemStore}>
//           <Text>推荐理由：药店最少</Text>
//           <View className={s.content}>
//             <View className={s.title}>仁爱大药房</View>
//             <View className={s.long}>3.8km</View>
//             <View className={s.item}>
//               <View className={s.img}></View>
//               <View className={s.flex}>
//                 <Text>多沙复飞颗粒胶囊</Text>
//                 <Text>4mg*10片</Text>
//               </View>
//               <View>*1</View>
//             </View>
//           </View>
//         </View>
//       </View>
//     </>
//   );
// };
import * as React from 'react';
import { useQuery } from 'remax';
import { Text, View } from 'remax/one';
import { getLocation, getSystemInfoSync, setStorage } from 'remax/wechat';

import Empty from '@/components/empty';
import { PHARMACY } from '@/constants/storage';
import { LINEAR_GRADIENT_WARNING } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { PrescribeService } from '@/services';
import { isArray } from '@/utils';
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
  const [params, setParams] = React.useState<any>({});

  const { data, error, run, loading } = useRequest(
    async () => {
      const { longitude, latitude } = await getLocation();
      return PrescribeService.recommendStoreList({ prescriptionId: id, longitude, latitude });
    },
    {
      onSuccess() {
        !loaded && setPageCompleted(true);
      },
    },
  );

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
  const count = drugs?.length
    ? drugs.reduce((total: number, current: any) => total + current.count, 0)
    : 0;
  const {
    addTime,
    address,
    adminName,
    boxId,
    cityCode,
    countTotal,
    cover,
    delivery,
    distance,
    distanceStr,
    frequency,
    id: ID,
    isContainAll,
    latitude,
    locateType,
    longitude,
    medicineDTOList,
    mobile,
    name,
    parentId,
    parentStoreDTO,
    priceTotal,
    remark,
    sort,
    star,
    type,
  } = data || {};

  // 自选药店
  const goPharmacy = () => {
    history.push('/pages/prescribe/pharmacy/list/index', { id });
  };

  const onConfirm = (item: any) => {
    setStorage({ key: PHARMACY, data: item });
    history.replace('/pages/prescribe/order/confirm/index', { id });
  };

  return (
    <View className={s.wrapper}>
      {isArray(data) && data?.length > 0 ? (
        data.map((store: any, i: number) => (
          <View key={i}>
            {store.remark && <View className={s.remark}>推荐理由：{store.remark}</View>}
            <View className={s.card} key={i}>
              <View className={s.flexBox}>
                <View className={s.pharmacyName}>{store.name}</View>
                <View className={s.distance}>{store.distanceStr}</View>
              </View>
              <View className={s.prescriptionList}>
                {isArray(store?.medicineDTOList) &&
                  store?.medicineDTOList.map((item: any) => (
                    <View key={item.id} className={s.prescriptionItem}>
                      <View
                        className={s.picture}
                        style={item.cover ? { backgroundImage: `url(${item.cover})` } : {}}
                      />
                      <View>
                        <View className={s.name}>
                          <Text>{item.commonName || item.name}</Text>
                          <Text className={s.amount}>*{item.count}</Text>
                        </View>
                        <View className={s.brief}>
                          <Text>
                            {item.drugName} {item.specName}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
              </View>
              <View className={s.rightContent}>
                <Button
                  color={LINEAR_GRADIENT_WARNING}
                  size='small'
                  round
                  bindclick={() => onConfirm(store)}
                  loading={loading}
                >
                  立即支付
                </Button>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View className={s.container}>
          <Empty image='message' description='暂无推荐药店' local />
        </View>
      )}
      <View className={s.toolbar} style={{ bottom: safeAreaHeight }} onTap={() => goPharmacy()}>
        切换自选药店
      </View>
    </View>
  );
};
