import createMapper from 'map-factory';

import { Doctor } from './index.types';

function query(source = {}): Doctor {
  const mapper = createMapper();

  mapper.map('bannerUrl').to('banner');

  return mapper.execute(source);
}

const DoctorMapper = {
  query,
};

export default DoctorMapper;
