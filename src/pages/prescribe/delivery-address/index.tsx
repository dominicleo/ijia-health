import * as React from 'react';
import { useNativeEffect, useQuery } from 'remax';
import { usePageEvent } from 'remax/macro';
import { getSystemInfoSync, setNavigationBarTitle, View } from 'remax/wechat';

import Toast from '@/components/toast';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { PrescribeService } from '@/services';
import history from '@/utils/history';
import Area from '@vant/weapp/lib/area';
import Button from '@vant/weapp/lib/button';
import Cell from '@vant/weapp/lib/cell';
import Field from '@vant/weapp/lib/field';
import Popup from '@vant/weapp/lib/popup';
import Skeleton from '@vant/weapp/lib/skeleton';
import Switch from '@vant/weapp/lib/switch';

import s from './index.module.less';

interface FormProps {
  mobile?: string;
  areaName?: string;
  street?: string;
  isDefault?: boolean;
  accepter?: string;
}
export default () => {
  const query = useQuery();
  // 页面数据加载状态
  const [loaded, setPageCompleted] = React.useState(false);
  const { data, run, error, loading } = useRequest(() => PrescribeService.getArea(), {
    manual: true,
    onSuccess() {},
  });
  const { run: getDetail, loading: detailing } = useRequest(
    () => PrescribeService.addressDetail(query.addressId),
    {
      manual: true,
      onSuccess(result, params) {
        const { mobile, areaName, street, isDefault, accepter, areaId } = result;
        setState({ mobile, accepter, isDefault, street, areaName });
        data &&
          Object.entries(data.source).forEach((entry) => {
            entry[1] == areaId ? setAreaId(entry[0]) : setAreaId(areaId);
          });
        !loaded && setPageCompleted(true);
      },
    },
  );
  usePageEvent('onLoad', () => {
    setNavigationBarTitle({
      title: query.addressId ? '编辑地址' : '新增地址',
    });
  });
  useNativeEffect(() => {
    run().then(() => {
      query.addressId && getDetail();
    });
  }, [query.addressId]);
  const [state, changeState] = React.useState<FormProps>({
    mobile: '',
    areaName: '',
    street: '',
    isDefault: false,
    accepter: '',
  });
  const setState = (restState: FormProps) => changeState({ ...state, ...restState });

  /** 安全区 */
  const { safeArea } = getSystemInfoSync();
  const safeAreaHeight = safeArea.bottom - safeArea.height;
  const [areaId, setAreaId] = React.useState('');
  const [popupShow, setPopup] = React.useState(false);

  const addressConfirm = (event: any) => {
    const arr = event.detail.values;
    setPopup(false);
    let name = '';
    arr.forEach((Item: any) => {
      name += Item.name;
    });
    const num = arr[arr.length - 1].code;
    data.source[num] ? setAreaId(data.source[num]) : setAreaId(num);
    setState({ areaName: name });
  };
  const submitData = async () => {
    const { accepter, street, mobile, isDefault } = state;
    console.log('areaId', areaId);
    if (!accepter || !mobile || !areaId || !street) {
      Toast('请补全信息后提交');
      return;
    }
    if (!/[0-9]{11}/.test(mobile)) {
      Toast('请输入正确的手机号');
      return;
    }
    // 如果是新建
    if (!query.addressId) {
      const res = await PrescribeService.addAddress({
        accepter,
        areaId,
        street,
        mobile,
        isDefault,
      });
      const { code, message } = res;
      if (code == 200) {
        Toast(message);
        history.back();
      }
    } else {
      let copyArea = '';
      Object.entries(data.source).forEach((entry) => {
        copyArea = entry[1] == areaId ? entry[0] : areaId;
      });
      const res = await PrescribeService.updateAddress({
        ...state,
        addressId: query.addressId,
        areaId: copyArea,
      });
      const { code, message } = res;
      if (code == 200) {
        Toast(message);
        setAreaId('');
        history.back();
      }
    }
  };
  if (!loaded && query.addressId) {
    return (
      <View className={s.wrapper}>
        <View className={s.card}>
          <Skeleton title row={16} />
        </View>
      </View>
    );
  }
  return (
    <>
      <Toast.Component />
      <View className={s.header}>
        <Field
          value={state.accepter}
          label='收货人'
          placeholder='请填写收货人姓名'
          border
          bindinput={(event: any) => setState({ accepter: event.detail })}
        />
        <Field
          value={state.mobile}
          type='number'
          label='手机号码'
          placeholder='请填写收货人手机号码'
          border
          bindinput={(event: any) => setState({ mobile: event.detail })}
        />
        <Cell title='所在地区' value={state.areaName} is-link bindclick={() => setPopup(true)} />
        <Field
          value={state.street}
          label='详细地址'
          placeholder='街道、楼牌号等'
          type='textarea'
          border
          autosize
          bindinput={(event: any) => setState({ street: event.detail })}
        />

        <Cell center title='设置默认地址' label='提醒：每次下单会默认推荐使用该地址'>
          <Switch
            checked={state.isDefault}
            size='24px'
            bindchange={(e: any) => setState({ isDefault: e.detail })}
          />
        </Cell>
        <View className={s.toolbarBlank} style={{ paddingBottom: safeAreaHeight }} />
        <View className={s.button}>
          <Button
            customClass={s.btn}
            customStyle={{ bottom: safeAreaHeight }}
            round
            block
            color={LINEAR_GRADIENT_PRIMARY}
            bindclick={submitData}
          >
            保存
          </Button>
        </View>
        <Popup show={popupShow} position='bottom' bindclose={() => setPopup(false)}>
          <Area
            area-list={data}
            title='选择地址'
            value={areaId}
            bindcancel={() => setPopup(false)}
            bindconfirm={addressConfirm}
          />
        </Popup>
      </View>
    </>
  );
};
