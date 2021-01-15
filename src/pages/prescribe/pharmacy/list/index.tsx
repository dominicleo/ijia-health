import classnames from 'classnames';
import * as React from 'react';
import { useNativeEffect, useQuery } from 'remax';
import { unstable_batchedUpdates } from 'remax/runtime';
import { getLocation, getSystemInfoSync, ScrollView, setStorage, Text, View } from 'remax/wechat';

import Empty from '@/components/empty';
import Toast from '@/components/toast';
import { STORAGE } from '@/constants';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest, useUpdateEffect } from '@/hooks';
import { PrescribeService } from '@/services';
import { isArray } from '@/utils';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';
import Dialog from '@vant/weapp/lib/dialog';
import DropdownItem from '@vant/weapp/lib/dropdown-item';
import DropdownMenu from '@vant/weapp/lib/dropdown-menu';
import Icon from '@vant/weapp/lib/icon';
import Rate from '@vant/weapp/lib/rate';
import Skeleton from '@vant/weapp/lib/skeleton';
import Tag from '@vant/weapp/lib/tag';

import s from './index.module.less';

const SORT_FILTERS = [
  {
    value: '',
    text: '综合排序',
  },
  {
    value: 1,
    text: '距离最近',
  },
  // {
  //   value: 2,
  //   text: '评分最高',
  // },
];

const METHOD_FILTERS = [
  {
    value: '',
    text: '配送方式不限',
  },
  {
    value: 2,
    text: '到店取药',
  },
  {
    value: 1,
    text: '快递寄送',
  },
];

const DISTANCE_FILTERS = [
  {
    value: '',
    text: '距离不限',
  },
  {
    value: 1,
    text: '1公里',
  },
  {
    value: 2,
    text: '2公里',
  },
  {
    value: 3,
    text: '3公里',
  },
  {
    value: 4,
    text: '4公里',
  },
  {
    value: 5,
    text: '5公里',
  },
];

const DEFAULT_PARAMS: any = {
  sort: '',
  delivery: '',
  distance: '',
};

const FILTERS = {
  sort: SORT_FILTERS,
  delivery: METHOD_FILTERS,
  distance: DISTANCE_FILTERS,
};

let timer: any;

export default () => {
  const { id } = useQuery<{ id: string }>();
  const { safeArea } = getSystemInfoSync();
  const safeAreaHeight = safeArea.bottom - safeArea.height;
  const [params, setParams] = React.useState(DEFAULT_PARAMS);
  const [visible, setVisible] = React.useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = React.useState<any>(null);
  // 页面数据加载状态
  const [loaded, setPageCompleted] = React.useState(false);
  // 页面刷新控制
  const [triggered, setTriggered] = React.useState(false);
  const { data, run, error, loading } = useRequest(
    async () => {
      const { longitude, latitude } = await getLocation();
      return PrescribeService.getPharmacyList({ id, ...params, longitude, latitude });
    },
    {
      manual: true,
      onSuccess() {
        Toast.clear();
        !loaded && setPageCompleted(true);
        triggered && setTriggered(false);
      },
      onError() {
        Toast.clear();
      },
    },
  );

  useNativeEffect(() => {
    run();
  }, []);

  useUpdateEffect(() => {
    run();
  }, [params]);

  const onPageRefresherPulling = () => {
    if (!loaded || loading || triggered) return;
    !triggered && setTriggered(true);
  };

  const onPagePullDownRefresh = () => {
    if (!loaded || loading) return;
    run();
  };

  const clear = () =>
    unstable_batchedUpdates(() => {
      setVisible(false);
      timer && clearTimeout(timer);
      timer = setTimeout(() => setSelectedPharmacy(null), 300);
    });

  const onSelect = (item: any) => {
    unstable_batchedUpdates(() => {
      setSelectedPharmacy(item);
      setVisible(true);
    });
  };

  const onConfirm = async () => {
    setStorage({ key: STORAGE.PHARMACY, data: selectedPharmacy?.source });
    // 创建订单跳转到订单确认页
    history.replace('/pages/prescribe/order/confirm/index', { id });
    clear();
  };

  const onClose = (event: any) => {
    if (event?.detail === 'cancel') {
      clear();
    }
  };

  const scrollViewProps = {
    className: s.container,
    onRefresherPulling: onPageRefresherPulling,
    onRefresherRefresh: onPagePullDownRefresh,
    onRefresherAbort: () => setTriggered(false),
    refresherTriggered: triggered,
    refresherEnabled: loaded,
    refresherDefaultStyle: 'black',
    refresherBackground: '#f5f5f5',
    scrollY: true,
  };

  let content: any;

  if (!loaded) {
    content = Array.from(Array(4).keys()).map((_, index: number) => (
      <View key={`pharmacy_item_${index}`} className={s.item}>
        <Skeleton title row={4} />
      </View>
    ));
  } else if (isArray(data) && data.length) {
    content = data.map((item) => (
      <View key={item.id} className={s.item}>
        <View className={s.content}>
          <View
            className={s.picture}
            style={item.picture ? { backgroundImage: `url(${item.picture})` } : {}}
          />
          <View className={s.details}>
            <View className={s.title}>
              <View className={s.name}>{item.name}</View>
              <View className={s.distance}>{item.distance}km</View>
            </View>
            <View className={s.score}>
              <Rate value={item.score} color='#FAA701' void-color='#FAA701' size={12} allow-half />
            </View>
            <View className={s.tags}>
              {item.deliveryText.map((text) => (
                <Tag className={s.tag} plain>
                  {text}
                </Tag>
              ))}
            </View>
          </View>
        </View>
        <View className={s.footer}>
          {item.remark ? (
            <View
              className={classnames(s.tips, {
                [s.primary]: item.isContainAll,
                [s.warning]: !item.isContainAll,
              })}
            >
              {item.isContainAll ? <Icon name='check' /> : <Icon name='warning-o' />}
              {item.remark}
            </View>
          ) : (
            <View />
          )}
          <Button
            color={LINEAR_GRADIENT_PRIMARY}
            size='small'
            round
            bindclick={() => onSelect(item)}
          >
            选择
          </Button>
        </View>
      </View>
    ));
  } else {
    content = <Empty image='message' local />;
  }

  return (
    <>
      <Toast.Component />
      <View className={s.wrapper}>
        <DropdownMenu className={s.filter}>
          {Object.entries(FILTERS).map(([key, value]) => (
            <DropdownItem
              key={key}
              value={params[key]}
              options={value}
              bindchange={(event: any) => setParams({ ...params, [key]: event.detail })}
            />
          ))}
        </DropdownMenu>
        <ScrollView {...scrollViewProps} scrollY>
          <View className={s.main}>
            {content}
            <View className={s.toolbarBlank} style={{ paddingBottom: safeAreaHeight }} />
          </View>
        </ScrollView>
        <View className={s.toolbar} style={{ bottom: safeAreaHeight }}>
          <View className={s.toolbarInner}>
            <View className={s.left} onTap={() => history.back()}>
              推荐药店
            </View>
            <View className={s.right}>
              <View className={s.total}>
                <Text>已选</Text>
                <View className={classnames(s.value, { [s.digit]: false })}>
                  {selectedPharmacy?.drugs?.length || 0}
                </View>
              </View>
            </View>
          </View>
        </View>
        <Dialog
          use-slot
          width={318}
          show={visible}
          bindconfirm={onConfirm}
          bindclose={onClose}
          confirm-button-color='#0a95ff'
          show-cancel-button
          confirm-button-text='即刻下单'
          cancel-button-text='重新选择'
          async-close
        >
          <View className={s.selection}>
            <View className={s.selectionHeader}>
              <View className={s.title}>药店已选全</View>
              <View className={s.subtitle}>
                药方内所含{selectedPharmacy?.drugs?.length || 0}种药品已选全
              </View>
            </View>
            <View className={s.confirmCard}>
              <View className={s.hospitalTitle}>{selectedPharmacy?.name}</View>
              {isArray(selectedPharmacy?.drugs) &&
                selectedPharmacy?.drugs.map((drug: any) => (
                  <View className={s.drug} key={drug.id}>
                    <View
                      className={s.picture}
                      style={drug.picture ? { backgroundImage: `url(${drug.picture})` } : {}}
                    />
                    <View className={s.details}>
                      <View className={s.name}>
                        {drug.commonName || drug.name}
                        <View className={s.total}>*{drug.count || 0}</View>
                      </View>
                      <View className={s.subtitle}>{drug.specName}</View>
                    </View>
                  </View>
                ))}
            </View>
          </View>
        </Dialog>
      </View>
    </>
  );
};
