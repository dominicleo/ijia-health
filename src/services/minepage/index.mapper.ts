import createMapper from 'map-factory';

import { Minepage } from './index.types';

function query(source = {}): Minepage {
  const mapper = createMapper();

  mapper
    .map('userName')
    .to('username')
    .map('portraitUrl')
    .to('avatar')
    .map('attentiomNum')
    .to('followNumber', undefined, () => 0)
    .map('collectionNum')
    .to('bookmarkNumber', undefined, () => 0)
    .map('loginTimes', undefined, () => 0);

  return mapper.execute(source);
}

const MinipageMapper = {
  query,
};

export default MinipageMapper;
