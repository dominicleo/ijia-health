import classnames from 'classnames';
import * as React from 'react';
import { ScrollView, Swiper, SwiperItem, Text, View } from 'remax/wechat';

import Empty from '@/components/empty';
import SafeArea from '@/components/safe-area';
import Toast from '@/components/toast';
import { MESSAGE } from '@/constants';
import { GETTING_DATA } from '@/constants/message';
import PAGE from '@/constants/page';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { OrderService } from '@/services';
import { Doctor } from '@/services/doctor/index.types';
import { isArray, isPlainObject } from '@/utils';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';
import Loading from '@vant/weapp/lib/loading';
import Popup from '@vant/weapp/lib/popup';
import Skeleton from '@vant/weapp/lib/skeleton';

import ChatingContext from '../context';
import { CHATING_ACTION_TYPE, CHATING_TOOLBAR } from '../types.d';
import s from './index.less';
import { useSetRecoilState } from 'recoil';
import { focusState, toolbarState } from '../atoms';
import { SUBSCRIBE_MESSAGE_TEMPLATE_TYPE } from '@/services/subscribe/index.types.d';

const ChatingPayment: React.FC<{ doctor: Doctor }> = React.memo(({ doctor }) => {
  const { chating$ } = React.useContext(ChatingContext);
  const [visible, setVisible] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [loaded, setLoaded] = React.useState(false);
  const setFocus = useSetRecoilState(focusState);
  const setToolbar = useSetRecoilState(toolbarState);
  const { data, error, loading, run } = useRequest(
    (doctorId) => OrderService.getGoodsByDoctorId(doctorId),
    {
      manual: true,
      onSuccess: () => setLoaded(true),
    },
  );

  const { run: submit, loading: submitting } = useRequest(OrderService.create, {
    manual: true,
    onSuccess: () => setLoaded(true),
  });

  const selectedType: any = isArray(data) && data.find((_, index) => index === active);
  const selectedGoods: any =
    isPlainObject(selectedType) &&
    isArray(selectedType.items) &&
    selectedType.items.find((_: any, index: number) => selectedType.selectedIndex === index);

  const selectedPrice =
    isPlainObject(selectedGoods) && selectedGoods.price ? (
      <>
        ￥<Text>{selectedGoods.price}</Text>
      </>
    ) : null;

  chating$?.useSubscription((action) => {
    if (action.type !== CHATING_ACTION_TYPE.PAYMENT) return;
    setVisible(true);
    setToolbar(CHATING_TOOLBAR.HIDDEN);
    setFocus(false);
  });

  const init = () => {
    !loaded && run(doctor.id);
  };

  const onSubmit = async () => {
    if (loading || submitting) return;
    if (!(isPlainObject(selectedGoods) && isPlainObject(doctor))) {
      Toast('数据异常，请重试');
      return;
    }

    const { callback, orderId } = await submit({
      doctor,
      goodsId: selectedGoods.seq,
      price: selectedGoods.price,
    });

    setVisible(false);

    if (!callback) {
      chating$?.emit({ type: CHATING_ACTION_TYPE.REFRESH_ORDER });
      return;
    }

    history.push(PAGE.CASHIER, {
      orderId,
      subscribeKey: SUBSCRIBE_MESSAGE_TEMPLATE_TYPE.MY_DOCTOR,
    });
  };

  let content;

  if (loaded) {
    content = (
      <>
        <View className={s.toolbar}>
          <Button
            color={LINEAR_GRADIENT_PRIMARY}
            disabled={submitting || !isPlainObject(selectedGoods)}
            loading={submitting}
            bindclick={onSubmit}
            block
            round
          >
            {selectedPrice}确认支付
          </Button>
          <SafeArea />
        </View>
        <View className={s.payment}>
          <View className={s.tabs}>
            {data!.map(({ key, title }, index) => (
              <View
                key={key}
                className={classnames(s.tab, { [s.active]: index === active })}
                onClick={() => setActive(index)}
              >
                <View>{title}</View>
              </View>
            ))}
          </View>
          <Swiper
            className={s.content}
            current={active}
            onChange={({ detail }) => (detail.source = 'touch' && setActive(detail.current))}
          >
            {data!.map(({ key, selectedIndex, items }) => (
              <SwiperItem key={key}>
                <ScrollView className={s.container} scrollY>
                  {key === 'monthly' && (
                    <View className={s.message}>套餐订单中包含图文、音/视频服务</View>
                  )}
                  {isArray(items) &&
                    items.length > 0 &&
                    items.map((item, index) => (
                      <View
                        key={item.seq}
                        className={classnames(s.item, {
                          [s.selected]: selectedIndex === index,
                        })}
                      >
                        <View>
                          <View className={s.title}>{item.goodsName}</View>
                          <View className={s.subtitle}>
                            {item.goodsType === 'ALL_SINGLE' && `每次服务时长为${item.unit}`}
                            {item.goodsType === 'ALL_MONTH' &&
                              `有效期${item.goodsName.replace('套餐', '')}`}
                          </View>
                        </View>
                        <View className={s.price}>
                          ￥{item.price}/{item.goodsType === 'ALL_SINGLE' ? '次' : item.unit}
                        </View>
                      </View>
                    ))}
                  <SafeArea />
                </ScrollView>
              </SwiperItem>
            ))}
          </Swiper>
        </View>
      </>
    );
  } else if (error) {
    content = (
      <Empty
        image='record'
        description={
          <>
            {MESSAGE.REQUEST_FAILED}
            <View>{error.message}</View>
          </>
        }
      >
        <Button
          type='primary'
          size='small'
          bindclick={init}
          loading={loading}
          disabled={loading}
          round
        >
          {MESSAGE.RETRY}
        </Button>
      </Empty>
    );
  } else {
    content = (
      <View className={s.loader}>
        <View className={s.tabs}>
          <Skeleton row={2} rowWidth='60px' loading />
        </View>
        <Loading customClass={s.loading} type='circular' size='24' vertical>
          {GETTING_DATA}
        </Loading>
      </View>
    );
  }

  return (
    <Popup
      show={visible}
      position='bottom'
      bindenter={init}
      bindclose={() => setVisible(false)}
      round
    >
      <View className={s.wrapper}>{content}</View>
    </Popup>
  );
});

export default ChatingPayment;
