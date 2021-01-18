import dayjs from 'dayjs';
import createMapper from 'map-factory';

import { CreateOrderResponse, Order } from './index.types';

function query(source = {}): Order {
  const mapper = createMapper();

  mapper
    .map('orderId')
    .to('id')
    .map('totalAmount')
    .to('amount')
    .map('orderStatus')
    .to('status')
    .map('paymentStatus')
    .map('processStatus')
    .map('payExpireTime')
    .to('paymentExpire', (value: string) => dayjs(value).valueOf())
    .map('remainTime')
    .to('expire')
    .map('goodsName')
    .map('createTime')
    .to('createdAt');

  return mapper.execute(source || {});
}

function create(source = {}): { callback: boolean; orderId: string } {
  const mapper = createMapper();
  mapper.map('needVendorCallback').to('callback').map('payOrderNo').to('orderId');

  return mapper.execute(source);
}

function payment(source = {}): CreateOrderResponse {
  const mapper = createMapper();
  mapper
    .map('needVendorCallback')
    .to('callback')
    .map('vendorData.timestamp')
    .to('params.timeStamp')
    .map('vendorData.nonceStr')
    .to('params.nonceStr')
    .map('vendorData.sign')
    .to('params.paySign')
    .map('vendorData.wePaySignType')
    .to('params.signType')
    .map('vendorData.prepayId')
    .to('params.package');

  return mapper.execute(source);
}

const OrderMapper = {
  query,
  create,
  payment,
};

export default OrderMapper;
