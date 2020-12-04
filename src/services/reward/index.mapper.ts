import createMapper from 'map-factory';

import { RewardQuery } from './index.types';

function query(source = {}): RewardQuery {
  const mapper = createMapper();

  mapper
    .map('bannerUrl')
    .to('banner')
    .map('data[].desc')
    .to('gifts[].text')
    .map('data[].count')
    .to('gifts[].count')
    .map('data[].itemUrl')
    .to('gifts[].image')
    .map('doctorId')
    .to('doctor.id')
    .map('doctorImg')
    .to('doctor.avatar')
    .map('doctorName')
    .to('doctor.name')
    .map('doctorOfficer')
    .to('doctor.officer')
    .map('hospitalName')
    .to('doctor.hospitalName')
    .map('departmentName')
    .to('doctor.departmentName');

  return mapper.execute(source);
}

const RewardMapper = {
  query,
};

export default RewardMapper;
