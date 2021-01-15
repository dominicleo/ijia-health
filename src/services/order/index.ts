import fetch from '@/utils/fetch';
import OrderMapper from './index.mapper';

export const query = async (doctorId: string) => {
  const response = await fetch.post(
    '/api/api/order/getMaxOrderByUserIdAndDoctorIdAndGoodsCode',
    null,
    {
      params: { doctorId, goodsCode: 'MY_DOCTOR' },
    },
  );
  return OrderMapper.query(response.data || {});
};
