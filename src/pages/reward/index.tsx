import classnames from 'classnames';
import * as React from 'react';
import { usePageEvent } from 'remax/macro';
import { hideKeyboard, Text, View } from 'remax/wechat';

import Toast from '@/components/toast';
import { LINEAR_GRADIENT_WARNING } from '@/constants/theme';
import { useQuery, useRequest } from '@/hooks';
import useSetState from '@/hooks/useSetState';
import { RewardService } from '@/services';
import { isArray } from '@/utils';
import Button from '@vant/weapp/lib/button';
import Popup from '@vant/weapp/lib/popup';
import Field from '@vant/weapp/lib/field';
import Skeleton from '@vant/weapp/lib/skeleton';

import s from './index.less';

interface State {
  value?: string;
  focus: boolean;
  /** 自定义金额 */
  customAmount: number;
  selectedIndex: number;
  /** 自定义金额界面展示状态 */
  visible: boolean;
}

export default () => {
  const { doctorId } = useQuery();

  const timer = React.useRef<NodeJS.Timeout>();
  const [state, setState] = useSetState<State>({
    value: '',
    focus: false,
    customAmount: 0,
    selectedIndex: 0,
    visible: false,
  });

  const isSelectedCustom = state.selectedIndex === -1;

  const { data, run, loading } = useRequest(
    async (params) => {
      const response = await RewardService.query(params);
      return { ...response, loaded: true };
    },
    { manual: true },
  );

  const clear = () => timer.current && clearTimeout(timer.current);

  React.useEffect(() => clear, []);

  usePageEvent('onShow', () => {
    if (!doctorId) return;
    run(doctorId);
  });

  const onClickGift = (index: number) => {
    setState({ selectedIndex: index, value: '', customAmount: undefined });
  };

  const onClickCustom = () => {
    setState({
      visible: true,
    });

    clear();
    timer.current = setTimeout(() => {
      setState({ focus: true });
    }, 350);
  };

  const onConfirm = () => {
    const value = state.value ? parseInt(state.value) : 0;
    setState({
      selectedIndex: value > 0 ? -1 : undefined,
      customAmount: value || undefined,
      focus: false,
      visible: false,
    });
    hideKeyboard();
  };

  const onClose = () => {
    setState({
      value: '',
      focus: false,
      customAmount: undefined,
      visible: false,
    });
    hideKeyboard();
  };

  const onSubmit = () => {};

  const { banner, doctor, gifts = [], loaded } = data || {};
  const bannerStyle: React.CSSProperties = banner ? { backgroundImage: `url(${banner})` } : {};
  const avatarStyle: React.CSSProperties = doctor?.avatar
    ? { backgroundImage: `url(${doctor.avatar})` }
    : {};

  return (
    <>
      <Toast.Component />
      <Popup show={state.visible} position='bottom' bindclose={onClose} safeAreaInsetBottom>
        <View className={s.form}>
          <View className={s.value}>
            <Field
              type='number'
              value={state.value}
              focus={state.focus}
              border={false}
              bindchange={(event) => setState({ value: event.detail })}
              bindblur={() => setState({ focus: false })}
            />
          </View>
          <Button color={LINEAR_GRADIENT_WARNING} bindclick={onConfirm} size='small' round block>
            确认
          </Button>
        </View>
      </Popup>
      <View className={s.banner} style={bannerStyle} />
      <View className={s.wrapper} onClick={() => setState({loader: !state.loader})}>
        <View className={s.main}>
          <View className={s.doctor}>
            <View className={s.avatar} style={avatarStyle} />
            <View>
              <Skeleton  loading={state.loader}>
                <View className={s.content}>
                  <Text>{doctor?.name}</Text>
                  <Text>{doctor?.officer}</Text>
                </View>
                <View className={s.brief}>
                  <Text>{doctor?.hospitalName}</Text>
                  <Text>{doctor?.departmentName}</Text>
                </View>
              </Skeleton>
            </View>
          </View>
          <View className={s.gifts}>
            {isArray(gifts) &&
              gifts.map(({ text }, index) => (
                <View
                  key={`reward_gift_item_${index}`}
                  className={classnames(s.gift, { [s.selected]: index === state.selectedIndex })}
                  onClick={() => onClickGift(index)}
                >
                  {text}
                </View>
              ))}
            <View
              className={classnames(s.gift, s.custom, { [s.selected]: isSelectedCustom })}
              onClick={onClickCustom}
            >
              {isSelectedCustom ? `￥${state.customAmount}` : '自定义'}
            </View>
          </View>
        </View>
        <View className={s.submit}>
          <Button
            type='primary'
            color={LINEAR_GRADIENT_WARNING}
            bindclick={onSubmit}
            loading={loading}
            disabled={!loaded}
            round
            block
          >
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
