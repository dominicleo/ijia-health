import fetch from '@/utils/fetch';

import DoctorMapper from './index.mapper';
import { Doctor, GetMyDoctorListParams } from './index.types';

export const query = async (doctorId: string) => {
  const response = await fetch.get(`/api/doctor/${doctorId}/vo`);
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

const GET_LIST_DEFAULT_PARAMS = { page: 1, size: 10 };

export async function getMyDoctorList(params: GetMyDoctorListParams) {
  const { page, size } = { ...GET_LIST_DEFAULT_PARAMS, ...params };
  const response = await fetch.post('/api/api/myDoctor/getMyDoctors', {
    pageNum: page,
    pageSize: size,
    doctorRelationShip: 1,
  });

  return DoctorMapper.getMyDoctorList(response.data);
}

export async function addMyDoctor(
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
  return fetch.post('/api/api/myDoctor/deleteMyDoctorById', DoctorMapper.follow(doctor));
}

export async function removeMyDoctor(id: number) {
  return fetch.post('/api/api/myDoctor/deleteMyDoctorById', {}, { params: { id } });
}
