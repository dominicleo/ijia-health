import classnames from 'classnames';
import * as React from 'react';
import { usePageEvent } from 'remax/macro';
import { Text, View } from 'remax/wechat';

import Toast from '@/components/toast';
import { LINEAR_GRADIENT_WARNING } from '@/constants/theme';
import { useQuery, useRequest } from '@/hooks';
import useSetState from '@/hooks/useSetState';
import { RewardService } from '@/services';
import { isArray } from '@/utils';
import Button from '@vant/weapp/lib/button';

import s from './index.less';

export default () => {
  const { doctorId } = useQuery();

  const [state, setState] = useSetState({
    /** 自定义金额 */
    customAmount: 0,
    selectedIndex: null,
    /** 自定义金额界面展示状态 */
    visible: false,
  });

  const { data, run, loading } = useRequest(RewardService.query, { manual: true });
  usePageEvent('onShow', () => {
    if (!doctorId) return;
    run(doctorId);
  });

  const { banner, doctor, gifts = [] } = data || {};
  const bannerStyle: React.CSSProperties = banner ? { backgroundImage: `url(${banner})` } : {};
  const avatarStyle: React.CSSProperties = doctor?.avatar
    ? { backgroundImage: `url(${doctor.avatar})` }
    : {};
  return (
    <>
      <Toast.Component />
      <View className={s.banner} style={bannerStyle} />
      <View className={s.wrapper}>
        <View className={s.main}>
          <View className={s.doctor}>
            <View className={s.avatar} style={avatarStyle} />
            <View>
              <View className={s.content}>
                <Text>{doctor?.name}</Text>
                <Text>{doctor?.officer}</Text>
              </View>
              <View className={s.brief}>
                <Text>{doctor?.hospitalName}</Text>
                <Text>{doctor?.departmentName}</Text>
              </View>
            </View>
          </View>
          <View className={s.gifts}>
            {isArray(gifts) &&
              gifts.map(({ text }, index) => (
                <View key={`reward_gift_item_${index}`} className={s.gift}>
                  {text}
                </View>
              ))}
            <View className={classnames(s.gift, s.custom)}>自定义</View>
          </View>
        </View>
        <View className={s.submit}>
          <Button type='primary' color={LINEAR_GRADIENT_WARNING} round block>
            送心意
          </Button>
        </View>
        <View className={s.tips}>温馨提示：</View>
        <View className={s.reminder}>
          您的打赏金额将全部由医生获得，用于表达对医生的感谢。平台不参与抽成，最终解释权归爱加所有。
        </View>
      </View>
    </>
  );
};
