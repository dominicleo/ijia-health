import createMapper from 'map-factory';

import { Authorize } from './index.types';

function authorize(source = {}): Authorize {
  const mapper = createMapper();

  mapper.map('token').map('mobile');

  return mapper.execute(source);
}

const UserMapper = {
  authorize,
};

export default UserMapper;
