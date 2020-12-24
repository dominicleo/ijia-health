import createMapper from 'map-factory';

import { Authorize, YunxinConfig } from './index.types';

function authorize(source = {}): Authorize {
  const mapper = createMapper();

  mapper.map('token').map('mobile');

  return mapper.execute(source);
}

function getYunxinConfig(source = {}): YunxinConfig {
  const mapper = createMapper();

  mapper.map('accToken').to('token').map('accid').to('account');

  return mapper.execute(source);
}

const UserMapper = {
  authorize,
  getYunxinConfig,
};

export default UserMapper;
