import * as React from 'react';
import { useQuery } from 'remax';
import { usePageEvent } from 'remax/macro';
import { removeStorageSync } from 'remax/wechat';

import Empty from '@/components/empty';
import Toast from '@/components/toast';
import { STORAGE } from '@/constants';
import { useRequest } from '@/hooks';
import { PrescribeService } from '@/services';
import { AuthorizeError } from '@/utils/error';
import history from '@/utils/history';
import Button from '@vant/weapp/lib/button';

enum STATUS {
  /** 未支付 */
  UNPAIED = 'UNPAIED',
  /** 已支付 */
  PAIED = 'PAIED',
  /** 取消 */
  CANCEL = 'CANCEL',
  /** 无效 */
  INVALID = 'INVALID',
}

export default () => {
  const { id } = useQuery<{ id: string }>();
  const { error, run, loading } = useRequest(() => PrescribeService.query(id), {
    manual: true,
    onSuccess(response) {
      if (response.paymentStatus === 1 || response.stateOrigin === 1) {
        history.replace('/pages/prescribe/order/details/index', { id });
        return;
      }
      history.replace('/pages/prescribe/details/index', { id });
    },
  });

  usePageEvent('onShow', () => {
    Toast.loading({ message: '正在查询订单', duration: 0 });
    run().finally(() => Toast.clear());
    removeStorageSync(STORAGE.PHARMACY);
    removeStorageSync(STORAGE.SHIPPING_ADDRESS);
  });

  if (error && !AuthorizeError.is(error)) {
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

  return <></>;
};
