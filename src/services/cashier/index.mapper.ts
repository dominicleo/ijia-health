import dayjs from 'dayjs';
import createMapper from 'map-factory';

import { CashierQuery, CashierResult, CashierSubmitResponse } from './index.types';

function query(source = {}): CashierQuery {
  const mapper = createMapper();

  mapper
    .map('orderAmount')
    .to('amount')
    .map('token')
    .map('payChannelList[]')
    .keep(['code', 'name', 'icon'])
    .to('channels[]')
    .map('timeOutTime')
    .to('expire', (value: any) => dayjs(value).valueOf());

  return mapper.execute(source);
}

function result(source = {}): CashierResult {
  const mapper = createMapper();

  mapper
    .map('payOrderNo')
    .to('orderId')
    .map('payStatus')
    .to('status')
    .map('orderStatus')
    .map('createTime')
    .to('createdAt', (value: any) => dayjs(value).valueOf())
    .map('payTime')
    .to('paymentTime', (value: any) => dayjs(value).valueOf());

  return mapper.execute(source);
}

function submit(source = {}): CashierSubmitResponse {
  const mapper = createMapper();

  mapper
    .map('tradeOrderNo')
    .to('id')
    .map('payResponseExtraParam.timestamp')
    .to('params.timeStamp')
    .map('payResponseExtraParam.nonceStr')
    .to('params.nonceStr')
    .map('payResponseExtraParam.sign')
    .to('params.paySign')
    .map('payResponseExtraParam.signType')
    .to('params.signType')
    .map('payResponseExtraParam._package')
    .to('params.package');

  return mapper.execute(source);
}

const CashierMapper = {
  query,
  submit,
  result,
};

export default CashierMapper;
