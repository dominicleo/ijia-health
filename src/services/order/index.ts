import fetch from '@/utils/fetch';
import { DoctorService } from '..';
import OrderMapper from './index.mapper';
import { CreateOrderParams } from './index.types';

export const query = async (orderId: string) => {
  const response = await fetch.post('/api/api/order/getOrdersByIdAndUserId', null, {
    params: { orderId },
  });
  return OrderMapper.query(response.data || {});
};

export const queryByDoctorId = async (doctorId: string) => {
  const response = await fetch.post(
    '/api/api/order/getMaxOrderByUserIdAndDoctorIdAndGoodsCode',
    null,
    {
      params: { doctorId, goodsCode: 'MY_DOCTOR' },
    },
  );
  return OrderMapper.query(response.data || {});
};

export const create = async (params: CreateOrderParams) => {
  const { goodsId, price, doctor } = params;
  const response = await fetch.post('/api/api/order/addOrder', {
    doctorId: doctor.id,
    doctorName: doctor.name,
    doctorHeaderUrl: doctor.avatar,
    hospitalId: doctor.hospitalId,
    hospitalName: doctor.hospitalName,
    departmentId: doctor.departmentId,
    departmentName: doctor.departmentName,
    goodsPrice: price - 0,
    relationId: null,
    picUrl: '',
    id: null,
    goodsId,
    quantity: 1,
  });

  return OrderMapper.create(response.data);
};

export const payment = async (orderId: string) => {
  const response = await fetch.post('/api/pay/v2', {
    orderId,
    payChannel: 'WePay',
    orderType: 'ORDER',
    platform: 'WeApp',
  });
  return OrderMapper.payment(response.data);
};

export async function getGoods(id: number) {
  const response = await fetch.post('/api/api/goods/getGoodsById', {}, { params: { goodsId: id } });
  return response.data;
}

export async function getGoodsByDoctorId(doctorId: string) {
  const [singletime, monthly, { prices = [] }] = await Promise.all([
    getGoods(5),
    getGoods(6),
    DoctorService.getMyDoctor(doctorId),
  ]);

  const data = [
    {
      key: 'singletime',
      title: '单次',
      selectedIndex: 0,
      items: [
        Object.assign(
          {},
          singletime,
          prices.find((price: any) => price.type === 'singleTime'),
        ),
      ],
    },
    {
      key: 'monthly',
      title: '套餐',
      selectedIndex: 0,
      items: [
        Object.assign(
          {},
          monthly,
          prices.find((price: any) => price.type === 'monthly'),
        ),
      ],
    },
  ];

  return data;
}
