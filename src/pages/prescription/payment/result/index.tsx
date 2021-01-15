import classnames from 'classnames';
import * as React from 'react';
import { useQuery } from 'remax';
import { usePageEvent } from 'remax/macro';
import { unstable_batchedUpdates } from 'remax/runtime';
import { showModal, View } from 'remax/wechat';

import Empty from '@/components/empty';
import Toast from '@/components/toast';
import PAGE from '@/constants/page';
import { LINEAR_GRADIENT_PRIMARY } from '@/constants/theme';
import YunxinContainer from '@/containers/im';
import { useRequest } from '@/hooks';
import { PrescriptionService } from '@/services';
import { AuthorizeError } from '@/utils/error';
import history from '@/utils/history';
import Yunxin, { NIM_SCENE } from '@/utils/im';
import Button from '@vant/weapp/lib/button';
import Countdown from '@vant/weapp/lib/count-down';

import s from './index.module.less';

enum STATUS {
  /** 未支付 */
  UNPAIED = 'UNPAIED',
  /** 已支付 */
  PAIED = 'PAIED',
  /** 取消 */
  CANCEL = 'CANCEL',
  /** 无效 */
  INVALID = 'CANCEL',
}

enum BIND_STATUS {
  MINE_BIND = 'MINE_BIND',
  OTHERS_BIND = 'OTHERS_BIND',
  UN_BIND = 'UN_BIND',
}

const INVALID_CODE = 4118999;

export default () => {
  const { id, refer } = useQuery<{ id: string; refer: string }>();
  // 页面数据加载状态
  const [loaded, setPageCompleted] = React.useState(false);
  const [orderStatus, setOrderStatus] = React.useState<any>(null);

  const isFirst = refer && /^\/pages\/prescription\/index/i.test(decodeURIComponent(refer));

  // 初始化页面数据
  const { data, error, run, loading } = useRequest(
    async (): Promise<any> => {
      const [detailsResponse, bindStatusResponse, statusResponse] = await Promise.all([
        PrescriptionService.query(id),
        PrescriptionService.bindStatus(id),
        PrescriptionService.status(id),
      ]);

      detailsResponse.owner = statusResponse.owner;
      detailsResponse.status = statusResponse.status;

      return Object.assign(detailsResponse, {}, bindStatusResponse);
    },
    {
      manual: true,
      onSuccess(response) {
        Toast.clear();
        !loaded && setPageCompleted(true);
        setOrderStatus(response.status);
      },
      onError(error: any) {
        Toast.clear();
        if (error.code === INVALID_CODE) {
          unstable_batchedUpdates(() => {
            !loaded && setPageCompleted(true);
            setOrderStatus(STATUS.INVALID);
          });
          return;
        }
        if (AuthorizeError.is(error)) {
          history.push(PAGE.AUTHORIZE);
          return;
        }
      },
    },
  );

  usePageEvent('onShow', () => {
    Toast.loading({ message: '正在查询订单', duration: 0 });
    run();
  });

  // @ts-ignore
  if (error && error.code !== INVALID_CODE && !isAuthorizeError(error)) {
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

  if (!loaded) return <View></View>;

  const isPaied = STATUS.PAIED === orderStatus || STATUS.UNPAIED === orderStatus;
  const isInvalid = [STATUS.CANCEL, STATUS.INVALID].includes(orderStatus);

  const { userinfo, owner, doctor, bindStatus } = data || {};

  const next = async () => {
    if (bindStatus === BIND_STATUS.MINE_BIND) {
      const { account } = doctor || {};

      if (!account) {
        showModal({
          title: '系统提示',
          content: '页面参数异常',
          success() {
            history.push('/pages/index/index', null, { reLaunch: true });
          },
        });
        return;
      }

      try {
        Toast.loading({ duration: 0 });

        // 初始化云信
        await Yunxin.init(false);

        const scene = NIM_SCENE.P2P;
        const sessionId = [scene, account].join('-');
        // 设置当前会话
        await YunxinContainer.setSessionId(sessionId);

        history.push(PAGE.CHATING, { sessionId, account, scene }, { reLaunch: true });

        Toast.clear();
      } catch (error) {
        if (AuthorizeError.is(error)) {
          history.push(PAGE.AUTHORIZE);
          return;
        }
        Toast(error.message);
      }
      return;
    }
    if (bindStatus === BIND_STATUS.UN_BIND) {
      history.replace('/pages/prescription/information/confirm/index', { id });
      return;
    }
    history.push('/pages/index/index', null, { reLaunch: true });
  };

  return (
    <View className={s.wrapper}>
      {isInvalid && (
        <View className={s.main}>
          <View className={s.statusWrapper}>
            <View className={classnames(s.status, s.fail)} />
          </View>
          <View className={s.title}>处方超时已失效</View>
        </View>
      )}

      {isPaied && (
        <View className={s.main}>
          <View className={s.statusWrapper}>
            <View className={classnames(s.status, s.success)} />
          </View>
          <View className={s.title}>{isFirst ? '该订单已支付完成' : '支付成功'}</View>
          {bindStatus === 'OTHERS_BIND' && owner === false && !isFirst && (
            <View className={s.message}>
              <View>您已完成{userinfo?.name || ''}的处方单支付，本人可登录</View>
              <View>爱加健康APP查看更多处方信息</View>
            </View>
          )}
        </View>
      )}

      <View className={s.action}>
        <View className={s.button}>
          {isInvalid && (
            <Button
              color={LINEAR_GRADIENT_PRIMARY}
              round
              block
              bindclick={() => history.push('/pages/index/index', null, { reLaunch: true })}
            >
              返回首页
            </Button>
          )}
          {isPaied && (
            <Button color={LINEAR_GRADIENT_PRIMARY} round block bindclick={next}>
              <View className={s.btn}>
                {isFirst ? (
                  '返回首页'
                ) : (
                  <>
                    {bindStatus === BIND_STATUS.MINE_BIND && '查看处方'}
                    {bindStatus === BIND_STATUS.OTHERS_BIND && '知道了'}
                    {bindStatus === BIND_STATUS.UN_BIND && '下一步'}
                    &nbsp;(
                    <Countdown time={5000} format='ss' bindfinish={next} auto-start />)
                  </>
                )}
              </View>
            </Button>
          )}
        </View>
      </View>
    </View>
  );
};
