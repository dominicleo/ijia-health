import classnames from 'classnames';
import * as React from 'react';
import { usePageEvent } from 'remax/macro';
import { hideKeyboard, Text, View } from 'remax/wechat';

import Toast from '@/components/toast';
import { LINEAR_GRADIENT_WARNING } from '@/constants/theme';
import { useRequest } from '@/hooks';
import useSetState from '@/hooks/useSetState';
import { RewardService } from '@/services';
import { isArray, isDefine } from '@/utils';
import Button from '@vant/weapp/lib/button';
import Field from '@vant/weapp/lib/field';
import Popup from '@vant/weapp/lib/popup';
import Skeleton from '@vant/weapp/lib/skeleton';

import s from './index.less';
import { useQuery } from 'remax';
import history from '@/utils/history';
import PAGE from '@/constants/page';
import Empty from '@/components/empty';

interface State {
  value?: string;
  focus: boolean;
  /** 自定义金额 */
  customAmount: number;
  selectedIndex: number;
  /** 自定义金额界面展示状态 */
  visible: boolean;
}

const PLACEHOLDER_TEXT = '请输入自定义金额';

export default () => {
  const { articleId } = useQuery();

  const timer = React.useRef<NodeJS.Timeout>();
  const [state, setState] = useSetState<State>({
    value: '',
    focus: false,
    customAmount: 0,
    selectedIndex: 0,
    visible: false,
  });

  const isSelectedCustom = state.selectedIndex === -1;

  const { data, loading, error, run } = useRequest(
    async (params) => {
      const response = await RewardService.query(params);
      return { ...response, loaded: true };
    },
    { manual: true },
  );

  const { run: submit, loading: submitting } = useRequest(RewardService.submit, { manual: true });

  const clear = () => timer.current && clearTimeout(timer.current);

  React.useEffect(() => clear, []);

  const query = () => {
    if (!articleId) return;
    run(articleId);
  };

  usePageEvent('onShow', () => {
    query();
  });

  const onClickGift = (index: number) => {
    if (submitting) return;

    setState({ selectedIndex: index, value: '', customAmount: undefined });
  };

  const onClickCustom = () => {
    if (submitting) return;

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

    if (value === 0 || state.value === '') {
      Toast(state.value === '' ? PLACEHOLDER_TEXT : '自定义金额不能为0');
      return;
    }

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
      value: isSelectedCustom ? state.value : '',
      focus: false,
      customAmount: isSelectedCustom ? state.customAmount : undefined,
      visible: false,
    });
    hideKeyboard();
  };

  const onSubmit = async () => {
    if (submitting) return;

    if (!isSelectedCustom && !isDefine(state.selectedIndex)) {
      Toast('请选择打赏礼物');
      return;
    }

    const { orderId } = await submit({
      articleId,
      count: isSelectedCustom ? state.customAmount : gifts[state.selectedIndex].count,
      goodsId: 10,
      sourceType: 'ARTICLE',
    });
    history.push(PAGE.CASHIER, { orderId });
  };

  const { banner, doctor, gifts = [], loaded } = data || {};
  const bannerStyle: React.CSSProperties = banner ? { backgroundImage: `url(${banner})` } : {};
  const avatarStyle: React.CSSProperties = doctor?.avatar
    ? { backgroundImage: `url(${doctor.avatar})` }
    : {};

  if (error) {
    return (
      <Empty
        image='record'
        description={
          <>
            数据获取失败<View>{error.message}</View>
          </>
        }
      >
        <Button
          type='primary'
          size='small'
          bindclick={query}
          loading={loading}
          disabled={loading}
          round
        >
          重新加载
        </Button>
      </Empty>
    );
  }

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
              placeholder={PLACEHOLDER_TEXT}
              border={false}
              bindchange={(event) => setState({ value: event.detail })}
              bindblur={() => setState({ focus: false })}
              adjustPosition
            />
          </View>
          <Button
            customClass={s.confirm}
            color={LINEAR_GRADIENT_WARNING}
            bindclick={onConfirm}
            size='small'
            round
            block
          >
            确认
          </Button>
        </View>
      </Popup>
      <View className={s.banner} style={bannerStyle} />
      <View className={s.wrapper}>
        <View className={s.main}>
          <View className={s.doctor}>
            <View className={s.avatar} style={avatarStyle} />
            <View>
              <Skeleton title row={1} loading={!loaded}>
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
            {loaded ? (
              <>
                {isArray(gifts) &&
                  gifts.map(({ text }, index) => (
                    <View
                      key={`GIFT_${index}`}
                      className={classnames(s.gift, {
                        [s.selected]: index === state.selectedIndex,
                      })}
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
              </>
            ) : (
              Array.from(Array(6).keys()).map((_, index) => (
                <View key={`GIFT_loader_${index}`} className={classnames(s.gift, s.loader)} />
              ))
            )}
          </View>
        </View>
        <View className={s.submit}>
          <Button
            type='primary'
            color={LINEAR_GRADIENT_WARNING}
            bindclick={onSubmit}
            loading={submitting}
            disabled={!loaded || submitting}
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
