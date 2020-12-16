import fetch from '@/utils/fetch';

import DoctorMapper from './index.mapper';
import { Doctor } from './index.types';

export const query = async (doctorId: string) => {
  const response = await fetch.post('/api/api/reward/getRewardInfo', null, {
    params: { doctorId },
  });
  return DoctorMapper.query(response.data);
};

export function follow(
  doctor: Pick<
    Doctor,
    | 'id'
    | 'avatar'
    | 'name'
    | 'officer'
    | 'hospitalId'
    | 'hospitalName'
    | 'departmentId'
    | 'departmentName'
  >,
) {
  return fetch.post('/api/api/userDoctor/addUserDoctor', DoctorMapper.follow(doctor));
}

export function unfollow(doctorId: string) {
  return fetch.post(`/api/api/userDoctor/deleteUserDoctorByDoctorId`, {}, { params: { doctorId } });
}
