import date from '@/utils/date';
import createMapper from 'map-factory';

import { Doctor } from './index.types';

function doctorMapper() {
  const mapper = createMapper();

  mapper
    .map('id')
    .to('sourceId')
    .map('doctorAccId')
    .to('account')
    .map('doctorId')
    .or('doctorid')
    .to('id')
    .map('doctorName')
    .or('truename')
    .to('name')
    .map('doctorImg')
    .or('headimg')
    .to('avatar')
    .map('departmentId')
    .or('hospitalid')
    .to('hospitalId')
    .map('hospitalName')
    .map('departmentId')
    .or('departmentid')
    .to('departmentId')
    .map('departmentName')
    .map('officer')
    .map('follow')
    .map('followNum')
    .to('followNumber', undefined, () => 0)
    .map('areaName')
    .to('address')
    .map('createTime')
    .to('createdAt', (value: string) => date(value).valueOf());

  return mapper;
}

function query(source = {}): Doctor {
  return doctorMapper().execute(source);
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

function getMyDoctorList(source = []): Doctor[] {
  const mapper = createMapper();

  mapper.map('[]').to('[]', doctorMapper().each, []);

  return mapper.execute(source);
}

const DoctorMapper = {
  query,
  follow,
  getMyDoctorList,
};

export default DoctorMapper;
