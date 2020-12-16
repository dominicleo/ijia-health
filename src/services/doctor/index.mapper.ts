import createMapper from 'map-factory';

import { Doctor } from './index.types';

function query(source = {}): Doctor {
  const mapper = createMapper();

  mapper.map('bannerUrl').to('banner');

  return mapper.execute(source);
}

function follow(source = {}) {
  const mapper = createMapper();

  mapper
    .map()
    .keep(['officer', 'hospitalId', 'hospitalName', 'departmentId', 'departmentName'])
    .map('id')
    .to('doctorId')
    .map('avatar')
    .to('doctorImg')
    .map('name')
    .to('doctorName');

  return mapper.execute(source);
}

const DoctorMapper = {
  query,
  follow,
};

export default DoctorMapper;
