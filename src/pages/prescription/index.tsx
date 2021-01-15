import * as React from 'react';
import { useQuery } from 'remax';
import { usePageEvent } from 'remax/macro';

import Empty from '@/components/empty';
import Toast from '@/components/toast';
import { useRequest } from '@/hooks';
import { PrescriptionService } from '@/services';
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
  const { error, run, loading } = useRequest(() => PrescriptionService.status(id), {
    manual: true,
    onSuccess(response) {
      const { status, owner } = response;
      // 未支付，跳转订单确认页
      if (status === STATUS.UNPAIED) {
        history.replace('/pages/prescription/order/confirm/index', { id });
        return;
      }

      // 已支付，是本人
      if (status === STATUS.PAIED && owner) {
        history.replace('/pages/prescription/order/details/index', { id });
        return;
      }

      history.replace('/pages/prescription/payment/result/index', {
        id,
        refer: '/pages/prescription/index',
      });
    },
  });

  usePageEvent('onShow', () => {
    Toast({ message: '正在查询订单', duration: 0 });
    run();
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
