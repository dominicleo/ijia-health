import classnames from 'classnames';
import * as React from 'react';
import { usePageEvent } from 'remax/macro';
import { Image, ScrollView, showModal, Swiper, SwiperItem, Text, View } from 'remax/wechat';

import ChunkList from '@/components/chunk-list';
import Empty from '@/components/empty';
import Loadable from '@/components/loadable';
import SafeArea from '@/components/safe-area';
import { MESSAGE } from '@/constants';
import { LINEAR_GRADIENT_PRIMARY, LINEAR_GRADIENT_WARNING } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { PrescribeService } from '@/services';
import { Prescribe } from '@/services/prescribe/index.types';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';
import Skeleton from '@vant/weapp/lib/skeleton';

import s from './index.less';

const TABS = [
  { label: '全部', value: {} },
  { label: '待支付', value: { payStatus: 0 } },
  { label: '待取货', value: { orderStatus: 0 } },
  { label: '待发货', value: { orderStatus: 1 } },
  { label: '待收货', value: { orderStatus: 2 } },
  { label: '已完成', value: { orderStatus: 3 } },
];

const OrderItemLoader: React.FC<{ size?: number }> = ({ size }) => {
  const Item = () => (
    <View className={s.card}>
      <Skeleton avatar avatarSize='40px' row={2} rowWidth={['35%', '75%']} loading />
      <View className={s.fields}>
        <Skeleton row={2} loading />
      </View>
    </View>
  );

  return (
    <>
      {size && size > 1 ? (
        Array.from(Array(size).keys()).map((_, index) => <Item key={index} />)
      ) : (
        <Item />
      )}
    </>
  );
};

OrderItemLoader.defaultProps = {
  size: 1,
};

const OrderItem: React.FC<Prescribe> = React.memo(
  ({
    prescriptionId,
    doctorAvatar,
    doctorName,
    departmentName,
    hospitalName,
    conclusion,
    stateOrigin,
    statusText,
    createdAt,
    paymentStatus,
    orderDetails,
  }) => {
    const isNewProcess = stateOrigin === 1;

    const onClickOrderDetails = () => {
      if (isNewProcess) {
        history.push('/pages/prescription/order/details/index', { id: prescriptionId });
        return;
      }
      history.push('/pages/prescribe/order/details/index', { id: prescriptionId });
    };

    const onClickPayment = () => {
      PrescribeService.checkOrderIsPay(prescriptionId).then((response) => {
        if (!response) {
          showModal({
            title: MESSAGE.SYSTEM_PROMPT,
            content: '已超过支付有效期。请联系医生重新开方。',
            showCancel: false,
          });
          return;
        }

        if (isNewProcess) {
          history.push('/pages/prescription/index', { id: prescriptionId });
          return;
        }
        history.push('/pages/prescribe/payment/index', { id: prescriptionId });
      });
    };

    return (
      <View className={s.card}>
        <View className={s.header}>
          <Image className={s.avatar} src={doctorAvatar} lazyLoad />
          <View className={s.right}>
            <View className={s.title}>
              <View className={s.name}>{doctorName}</View>
              <View
                className={classnames(s.extra, {
                  [s.primary]: paymentStatus === 0,
                  [s.warning]: paymentStatus !== 0,
                })}
              >
                {statusText}
              </View>
            </View>
            <View className={s.subtitle}>
              <Text>{departmentName}</Text>
              <Text>{hospitalName}</Text>
            </View>
          </View>
        </View>
        <View className={s.fields}>
          <View className={s.field}>
            <Text>病情诊断：</Text>
            <Text>{conclusion}</Text>
          </View>
          <View className={s.field}>
            <Text>开方时间：</Text>
            <Text>{createdAt}</Text>
          </View>
        </View>
        <View className={s.footer}>
          {!isNewProcess && (
            <Button
              type='default'
              size='small'
              round
              bindclick={() =>
                history.push('/pages/prescribe/details/index', { id: prescriptionId })
              }
            >
              处方详情
            </Button>
          )}
          {orderDetails?.length > 0 && paymentStatus === 1 && (
            <Button
              color={LINEAR_GRADIENT_PRIMARY}
              size='small'
              round
              bindclick={onClickOrderDetails}
            >
              订单详情
            </Button>
          )}
          {orderDetails?.length > 0 && paymentStatus === 0 && (
            <Button color={LINEAR_GRADIENT_WARNING} size='small' round bindclick={onClickPayment}>
              去支付
            </Button>
          )}
        </View>
      </View>
    );
  },
);

const OrderList: React.FC<{ visible: boolean; value?: Record<string, any> }> = ({
  visible,
  value,
}) => {
  const [chunks, setChunks] = React.useState<Prescribe[][]>([]);
  const { data, error, loading, run, params } = useRequest(
    async (params?) => {
      const { list, pagination } = await PrescribeService.getList({ ...value, ...params });

      if (pagination.current === 1) {
        setChunks(list && list.length ? [list] : []);
      } else {
        list && list.length && setChunks([...chunks, list]);
      }

      return {
        loaded: true,
        completed: pagination.current * pagination.pageSize >= pagination.total,
      };
    },
    {
      manual: true,
    },
  );

  React.useEffect(() => {
    visible && !data?.loaded && run({ page: 1 });
  }, [visible]);

  usePageEvent('onShow', () => {
    const [page] = getCurrentPages();
    const refer = page.__displayReporter.showReferpagepath;
    if (['pages/authorize/index.html'].includes(refer) && visible) {
      run({ page: 1 });
    }
  });

  const retry = () => {
    if (loading) return;
    const [p = {}] = params || [];
    const page = p.page || 1;
    run({ page });
  };

  const onScrollToLower = () => {
    if (!data?.loaded || loading || data?.completed) return;
    const [p = {}] = params || [];
    const page = p.page || 1;
    run({ page: page + 1 });
  };

  if (data?.loaded) {
    return (
      <ScrollView className={s.container} onScrollToLower={onScrollToLower} scrollY>
        {chunks.length > 0 ? (
          <View>
            {chunks.map((chunk, index) => (
              <ChunkList key={`chunk_${index}`} chunkId={index} observeHeight={156 * 3}>
                {chunk.map((item) => (
                  <OrderItem key={`${index}_${item.id}`} {...item} />
                ))}
              </ChunkList>
            ))}
            <Loadable loading={!data?.completed} />
            <SafeArea />
          </View>
        ) : (
          <Empty image='message' local />
        )}
      </ScrollView>
    );
  } else if (error) {
    return (
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
          bindclick={retry}
          loading={loading}
          disabled={loading}
          round
        >
          {MESSAGE.RETRY}
        </Button>
      </Empty>
    );
  } else {
    return (
      <View className={s.container}>
        <OrderItemLoader size={4} />
      </View>
    );
  }

  return <></>;
};

export default () => {
  const [active, setActive] = React.useState(0);
  return (
    <View className={s.wrapper}>
      <View className={s.tabs}>
        {TABS.map((item, index) => (
          <View
            key={`tab_${index}`}
            className={classnames(s.tab, { [s.active]: index === active })}
            onClick={() => setActive(index)}
          >
            <View>{item.label}</View>
          </View>
        ))}
      </View>
      <Swiper
        className={s.content}
        current={active}
        onChange={({ detail }) => detail.source === 'touch' && setActive(detail.current)}
      >
        {TABS.map((item, index) => (
          <SwiperItem key={`swiper_${index}`}>
            <OrderList visible={active === index} value={item.value} />
          </SwiperItem>
        ))}
      </Swiper>
    </View>
  );
};
