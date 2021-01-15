import * as React from 'react';
import { useQuery } from 'remax';
import { showModal, View } from 'remax/wechat';

import Empty from '@/components/empty';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import { useRequest } from '@/hooks';
import { PrescribeService } from '@/services';
import dayjs from '@/utils/date';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';
import Skeleton from '@vant/weapp/lib/skeleton';

import s from './index.module.less';

const SEX_OPTION: any = {
  1: '男',
  2: '女',
};

export default () => {
  const { id } = useQuery<{ id: string }>();
  // 页面数据加载状态
  const [loaded, setPageCompleted] = React.useState(false);
  const { data: dataCode, run: detail } = useRequest(
    async (parmas) => PrescribeService.getHospitalInfo({ id: parmas }),
    {
      manual: true,
    },
  );
  const { data, error, run, loading } = useRequest(
    async (parmas) => {
      const [response, payStatus] = await Promise.all([
        PrescribeService.getByPrescriId({ id }),
        PrescribeService.checkOrderIsPay(id).catch(() => false),
      ]);

      return { ...response, payStatus };
    },
    {
      onSuccess(res) {
        !loaded && setPageCompleted(true);
        detail(res.applyDoctorHospitalId);
      },
    },
  );
  const {
    prescriptionNum,
    patientName,
    patientSex,
    patientAge,
    historyOfAllergies,
    conclusion,
    appeal,
    prescriptionDrugs,
    applyDoctorName,
    reviewerNameUrl,
    dispatchNameUrl,
    dispatchName,
    addtime,
    paymentType,
    stateOrigin,
    payStatus,
  } = data || {};
  console.log(data);
  const { hospitalName, medicalInsCode, specTips, sign } = dataCode || {};

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

  const checkDrugstore = (item: any) => {
    history.push('/pages/prescribe/pharmacy/recommend/index', { id });
  };
  const goPay = () =>
    PrescribeService.checkOrderIsPay(id).then((response) => {
      if (!response) {
        showModal({
          title: '提示',
          content: '已超过支付有效期。请联系医生重新开方。',
          showCancel: false,
        });
        return;
      }
      history.push('/pages/prescribe/order/confirm/index', { id });
    });
  return (
    <>
      <View className={s.wrapper}>
        <View className={s.hospitalName}>{hospitalName}</View>
        <View className={s.categoryName}>电子处方笺</View>
        <View>
          <View className={s.blue}>NO.{prescriptionNum}</View>
          <View className={s.contentTxt}>医疗机构编码：{medicalInsCode}</View>
          <View className={s.item}>
            <View>姓名：{patientName}</View>
            <View>性别：{SEX_OPTION[patientSex]}</View>
            <View>年龄：{patientAge}</View>
          </View>
          <View className={s.line24}>过敏史：{historyOfAllergies}</View>
        </View>
        <View className={s.line}></View>
        <View className={s.itemContent}>
          <View className={s.txtTitle}>主诉：</View>
          <View className={s.txt}>{appeal}</View>
        </View>
        <View className={s.itemContent}>
          <View className={s.txtTitle}>诊断：</View>
          <View className={s.txt}>{conclusion}</View>
        </View>

        <View className={s.itemContent}>
          {prescriptionDrugs && prescriptionDrugs.length > 0 && (
            <View className={s.txtTitle}>药方：</View>
          )}
          {prescriptionDrugs &&
            prescriptionDrugs.length > 0 &&
            prescriptionDrugs.map((item: any, index: number) => (
              <View className={s.medicine} key={index}>
                <View className={s.item}>
                  <View className={s.flex}>{item.drugChemicalName}</View>
                  <View>
                    {item.count}
                    {item.countUnit}
                  </View>
                </View>
                <View className={s.way}>
                  {item.spec} {item.frequency} 每次
                  {[item.phr || 0, item.useAmountUnit].filter(Boolean)}
                  {item.usaged}
                </View>
              </View>
            ))}
        </View>

        <View className={s.relative}>
          <View className={s.doc}>
            <View className={s.tit}>处方医师：</View>
            <View className={s.name}>{applyDoctorName}</View>
          </View>
          <View className={s.doc}>
            <View>审方药师：</View>
            <View className={s.name}>
              {reviewerNameUrl && (
                <View
                  style={{
                    backgroundImage: `url(${reviewerNameUrl})`,
                    height: '24px',
                    backgroundSize: '100% 100%',
                    width: '50px',
                  }}
                ></View>
              )}
            </View>
          </View>
          <View className={s.doc}>
            <View>发药药师：</View>
            <View
              className={s.name}
              style={dispatchNameUrl ? { backgroundImage: `url(${dispatchNameUrl})` } : {}}
            >
              {dispatchName}
            </View>
          </View>
          <View className={s.chemist}>
            <View>开方时间：{dayjs(addtime * 1000).format('L LT')}</View>
          </View>
          {sign && (
            <View className={s.sign} style={sign ? { backgroundImage: `url(${sign})` } : {}}></View>
          )}
        </View>
        {specTips ? (
          <View className={s.bgGrey}>
            <View>特别提示</View>
            <View>{specTips}</View>
          </View>
        ) : null}
      </View>
      {/* 会话0,增值1 */}
      {paymentType != 1 && stateOrigin == '0' && (
        <View className={s.toolbar}>
          <Button
            color={LINEAR_GRADIENT_PRIMARY}
            round
            block
            loading-size={22}
            bindclick={checkDrugstore}
            disabled={!payStatus}
          >
            {!payStatus ? '处方超时已失效' : '选择药店'}
          </Button>
        </View>
      )}
      {paymentType != 1 && stateOrigin == '1' && (
        <View className={s.toolbar}>
          <Button color={LINEAR_GRADIENT_PRIMARY} round block loading-size={22} bindclick={goPay}>
            立即支付
          </Button>
        </View>
      )}
    </>
  );
};
