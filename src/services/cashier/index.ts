import fetch from '@/utils/fetch';

import CashierMapper from './index.mapper';
import { CashierSubmitParams } from './index.types';

export const query = async (orderId: string) => {
  const response = await fetch.post(`/pay/pay/check-out.load/${orderId}`, null, {
    params: { tradeType: 'MINI' },
  });
  return CashierMapper.query(response.data);
};

export const submit = async (params: CashierSubmitParams) => {
  const { orderId, code, ...rest } = params;
  const response = await fetch.post(`/pay/pay/check-out.pay`, {
    payOrderNo: orderId,
    tradeType: 'MINI',
    wxAuthCode: code,
    ...rest,
  });
  return CashierMapper.submit(response.data);
};

export const result = async (id: string) => {
  const response = await fetch.post(`/pay/pay/check-out.query/${id}`);
  return CashierMapper.result(response.data);
};
