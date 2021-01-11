import createMapper from 'map-factory';

import { Authorize, UserInfo, YunxinConfig } from './index.types';

function authorize(source = {}): Authorize {
  const mapper = createMapper();

  mapper.map('token').map('mobile');

  return mapper.execute(source);
}

export function userinfo(data = {}): UserInfo {
  const mapper = createMapper();

  mapper.map('name').map('idCard').to('idCardNumber').map('phone').to('phoneNumber');

  return mapper.execute(data);
}

function getYunxinConfig(source = {}): YunxinConfig {
  const mapper = createMapper();

  mapper.map('accToken').to('token').map('accid').to('account');

  return mapper.execute(source);
}

const UserMapper = {
  authorize,
  userinfo,
  getYunxinConfig,
};

export default UserMapper;
