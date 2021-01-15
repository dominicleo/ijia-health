import classnames from 'classnames';
import * as React from 'react';
import { useQuery } from 'remax';
import { setClipboardData, showModal, Text, View } from 'remax/wechat';

import Empty from '@/components/empty';
import Toast from '@/components/toast';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { PrescribeService } from '@/services';
import { isArray } from '@/utils';
import dayjs from '@/utils/date';
import history from '@/utils/history';
import VantButton from '@vant/weapp/lib/button';
import Icon from '@vant/weapp/lib/icon';
import Skeleton from '@vant/weapp/lib/skeleton';

import s from './index.module.less';
import Button from '@vant/weapp/lib/button';

const ImageFrom = 'https://m.ijia120.com/miniprograms/from.png';
const ImageTo = 'https://m.ijia120.com/miniprograms/location.png';
const OPTION: any = {
  '0': {
    text: '待发货',
    color: 'orange',
  },
  '1': {
    text: '待收货',
    color: 'orange',
  },
  '2': {
    text: '已完成',
    color: 'blue',
  },
};

export default () => {
  const { id } = useQuery<{ id: string }>();
  // 页面数据加载状态
  const [loaded, setPageCompleted] = React.useState(false);

  const { data, error, run, loading } = useRequest(() => PrescribeService.orderDetail(id), {
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
    id: orderNumber,
    acceptMobile,
    acceptName,
    address,
    barcode,
    deliveryTime,
    lastAllocation,
    logisticsFee,
    medicineList,
    orderStatus,
    orderTotal,
    payTime,
    payType,
    prescriptionId,
    qrcode,
    store,
    type,
  }: any = data || {};
  console.log(data);
  const count = medicineList.length
    ? medicineList.reduce((total: number, current: any) => total + current.drugCount, 0)
    : 0;
  const completeDrugs = medicineList.filter(({ completeTime }: any) => completeTime);
  // const { loading: submitting, run: confirmReceipt } = useRequest(
  //   async () => {
  //     const response = await PrescribeService.confirmReceipt({
  //       prescriptionId: id,
  //     });
  //     return response;
  //   },
  //   {
  //     manual: true,
  //     onSuccess(response) {
  //       console.log(response);
  //       Toast.info('确认收货成功');
  //     },
  //   },
  // );
  const submitHandle = async (event: any) => {
    const { cancel } = await showModal({
      title: '系统提示',
      content: '确认收货?',
    });
    if (cancel) return;
    const res = await PrescribeService.confirmReceipt({
      prescriptionId: id,
    });
    Toast('确认收货成功');
    run();
  };
  const logisticsTap = (status: any) => {
    // 未发货不跳转
    if (status == 0) return;
    history.push('/pages/prescribe/logistics/index', { id });
  };
  return (
    <>
      <Toast.Component />
      <View className={s.wrapper} style={orderStatus == 1 ? { marginBottom: '80px' } : {}}>
        {type == 1 && (
          <View className={classnames(s.card, s.item)}>
            {(orderStatus == 0 || orderStatus == 1) && type == 1 ? (
              <>
                <View
                  className={s.qrcode}
                  style={qrcode ? { backgroundImage: `url(${qrcode})` } : {}}
                />
                <View className={classnames(s.code)}>
                  <View>
                    取药码：
                    <Text>{barcode}</Text>
                  </View>
                  <Text className={s.codetext}>请7天内尽快取药</Text>
                </View>
              </>
            ) : (
              <View
                className={classnames(s.code, orderStatus == 0 || orderStatus == 1 ? null : s.used)}
              >
                <View>
                  取药码：
                  <Text>{barcode}</Text>
                </View>
                <Text className={s.codetext}>{orderStatus == 2 ? '已使用' : '未使用'}</Text>
              </View>
            )}
          </View>
        )}

        {/* 订单状态 快递寄件，或者已完成*/}
        {(type == 2 || orderStatus == 2) && (
          <View className={classnames(s.status, s[OPTION[orderStatus]?.color])}>
            <Text>订单状态</Text>
            <Text className={s.textkey}>{OPTION[orderStatus]?.text}</Text>
          </View>
        )}
        {/* 物流信息 订单配送方式,1:到店取药,2:快递寄件,3:骑手配送 为2时有物流信息*/}
        {type == 2 && (
          <View className={classnames(s.item, s.logistics)} onTap={() => logisticsTap(orderStatus)}>
            <View className={s.title}>物流信息</View>
            <View className={classnames(s.flexBox, s.mgt40)}>
              <View
                className={classnames(s.icon)}
                style={{ backgroundImage: `url(${ImageFrom})` }}
              ></View>
              <View className={classnames(s.address, s.flex)}>
                <View>{OPTION[orderStatus]?.text}</View>
                <Text className={s.title}>
                  {deliveryTime ? dayjs(deliveryTime * 1000).format('L LTS') : null}
                </Text>
              </View>
              <Icon name='arrow' />
            </View>
            <View className={s.flexBox}>
              <View
                className={classnames(s.icon)}
                style={{ backgroundImage: `url(${ImageTo})` }}
              ></View>
              <View className={classnames(s.address, s.flex)}>
                <View>{address}</View>
                <Text className={s.title}>
                  {acceptName} {acceptMobile}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 药品list */}
        <View className={classnames(s.item, s.card)}>
          <View className={s.pharmacyName}>{store?.name}</View>
          {isArray(medicineList) &&
            medicineList?.length > 0 &&
            medicineList.map((item: any, index: number) => (
              <View className={s.prescriptionList} key={index}>
                <View className={s.prescriptionItem}>
                  <View
                    className={s.picture}
                    style={item.drugImage ? { backgroundImage: `url(${item.drugImage})` } : {}}
                  />
                  <View>
                    <View className={s.name}>
                      <Text>{item.drugName}</Text>
                      <Text className={s.amount}>￥{item.drugPrice}</Text>
                    </View>
                    <View className={s.brief}>
                      <Text>{`${item.drugCount}*${item.drugCountUnit}`}</Text>
                      <Text>*{item.drugCount}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
        </View>
        {/* 实付 */}
        <View className={classnames(s.card, s.item)}>
          <View className={s.total}>
            <View className={s.label}>
              药品实付款<Text>({count}件)</Text>
            </View>
            <View className={s.amount}>￥{orderTotal}</View>
          </View>
        </View>
        <View className={classnames(s.card, s.item)}>
          <View className={s.fieldset}>
            <View className={s.title}>{store?.type === 1 ? '药柜信息' : '药店信息'}</View>
            <View key={store.id} className={s.fields}>
              <View className={s.field}>
                <View className={s.label}>药店名称</View>
                <View className={s.value}>{store?.name}</View>
              </View>
              <View className={s.field}>
                <View className={s.label}>药店地址</View>
                <View className={s.value}>{store?.address}</View>
              </View>
              {!!store?.mobile && (
                <View className={s.field}>
                  <View className={s.label}>药店电话</View>
                  <View className={s.value}>{store?.mobile}</View>
                </View>
              )}
            </View>
          </View>
        </View>
        <View className={s.item}>
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
              {payType && (
                <View className={s.field}>
                  <View className={s.label}>付款方式</View>
                  <View className={s.value}>在线支付</View>
                </View>
              )}
              {payType && (
                <View className={s.field}>
                  <View className={s.label}>付款时间</View>
                  <View className={s.value}>{dayjs(payTime * 1000).format('L LTS')}</View>
                </View>
              )}
              {completeDrugs?.length > 0 && (
                <View className={s.field}>
                  <View className={s.label}>取药时间</View>
                  <View className={s.value}>
                    {completeDrugs.map((item: any) => (
                      <View key={item.id}>
                        {dayjs(item.completeTime).format('L LTS')}（{item.storeName} {item.name}）
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
        {orderStatus == 1 && type == 2 && (
          <View className={s.toolbar}>
            <VantButton
              color={LINEAR_GRADIENT_PRIMARY}
              round
              block
              loading-size={22}
              bindclick={submitHandle}
            >
              确认收货
            </VantButton>
          </View>
        )}
      </View>
    </>
  );
};
