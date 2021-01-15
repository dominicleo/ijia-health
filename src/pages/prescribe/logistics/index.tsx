import classnames from 'classnames';
import * as React from 'react';
import { useQuery } from 'remax';
import { View } from 'remax/wechat';

import Empty from '@/components/empty';
import { useRequest } from '@/hooks';
import { PrescribeService } from '@/services';
import Button from '@vant/weapp/lib/button';
import Skeleton from '@vant/weapp/lib/skeleton';

import s from './index.module.less';

const IconCar = 'https://m.ijia120.com/miniprograms/icon-car.png';

export default () => {
  const { id } = useQuery<{ id: string }>();
  console.log(id);
  const [loaded, setPageCompleted] = React.useState(false);

  const { data, error, run, loading } = useRequest(
    () => PrescribeService.getExpressReturn({ prescriptionId: id }),
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

  const { comName, data: dataList, nu }: any = data || {};

  console.log(data);
  return (
    <>
      <View className={s.wrapper}>
        <View className={classnames(s.item, s.flexBox, s.center)}>
          <View className={s.icon} style={{ backgroundImage: `url(${IconCar})` }}></View>
          <View className={classnames(s.flex, s.oh)}>
            <View className={classnames(s.content, s.flexBox, s.mgb)}>
              <View className={s.label}>发货物流</View>
              <View className={classnames(s.value, s.flex)}>{comName}</View>
            </View>
            <View className={classnames(s.content, s.flexBox)}>
              <View className={s.label}>物流单号</View>
              <View className={classnames(s.value, s.flex)}>{nu}</View>
            </View>
          </View>
        </View>
        <View className={classnames(s.step, s.item)}>
          {dataList &&
            dataList.length > 0 &&
            dataList.map((item: any, index: number) => (
              <View className={classnames(s.childItem, index == 0 && s.active)} key={index}>
                <View className={s.left}>{item.ftime}</View>
                <View className={s.box}>
                  <View className={s.dot}></View>
                  {index !== dataList.length - 1 && <View className={s.centerLine}></View>}
                </View>
                <View className={s.right}>{item.context}</View>
              </View>
            ))}
          {/* <View className={classnames(s.childItem, s.active)}>
            <View className={s.left}>2012-10-10 15:09:09</View>
            <View className={s.box}>
              <View className={s.dot}></View>
              <View className={s.centerLine}></View>
            </View>

            <View className={s.right}>
              收件人沈大胖已签收，非常感谢 使用爱加爱加快递期待再次为您 服务。
            </View>
          </View>

          <View className={classnames(s.childItem)}>
            <View className={s.left}>2012-10-10 15:09:09</View>
            <View className={s.box}>
              <View className={s.dot}></View>
              <View className={s.centerLine}></View>
            </View>
            <View className={s.right}>
              收件人沈大胖已签收，非常感谢 使用爱加爱加快递期待再次为您 服务。
            </View>
          </View> */}
        </View>
      </View>
    </>
  );
};
