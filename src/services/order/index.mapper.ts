import dayjs from 'dayjs';
import createMapper from 'map-factory';

import { Order } from './index.types';

function query(source = {}): Order {
  const mapper = createMapper();

  mapper
    .map('orderId')
    .to('id')
    .map('orderStatus')
    .to('status')
    .map('paymentStatus')
    .map('processStatus');

  return mapper.execute(source || {});
}

const OrderMapper = {
  query,
};

export default OrderMapper;
