import fetch from '@/utils/fetch';

import DoctorMapper from './index.mapper';
import { Doctor, GetListParams } from './index.types';

export const query = async (doctorId: string) => {
  const response = await fetch.get(`/api/doctor/${doctorId}/vo`);
  return DoctorMapper.query(response.data);
};

/** TODO 获取医生服务时长 */
export async function getMyDoctor(doctorId?: string) {
  const response = await fetch.get(`/api/doctor/${doctorId}/mydoctor`);
  return response.data;
}

export const queryByAccount = async (account: string) => {
  const response = await fetch.get(`/api/doctor/accid/${account}/mydoctor`);
  const { doctor, ...rest } = response.data || {};
  const original = Object.assign({}, doctor, rest);
  return DoctorMapper.query(original);
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

export async function getList(params: GetListParams) {
  const { page, size, ...rest } = { ...GET_LIST_DEFAULT_PARAMS, ...params };
  const response = await fetch.post('/api/doctor', rest, { params: { page, size } });
  return DoctorMapper.getList(response.data);
}

export async function getFollowList(params: GetListParams) {
  const { page, size } = { ...GET_LIST_DEFAULT_PARAMS, ...params };
  const response = await fetch.post('/api/api/userDoctor/getUserDoctors', {
    pageNum: page,
    pageSize: size,
  });
  return DoctorMapper.doctors(response.data);
}

export async function getMyDoctorList(params: GetListParams) {
  const { page, size } = { ...GET_LIST_DEFAULT_PARAMS, ...params };
  const response = await fetch.post('/api/api/myDoctor/getMyDoctors', {
    pageNum: page,
    pageSize: size,
    doctorRelationShip: 1,
  });

  return DoctorMapper.doctors(response.data);
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
  return fetch.post('/api/api/myDoctor/addMyDoctor', DoctorMapper.follow(doctor));
}

export async function removeMyDoctor(id: number) {
  return fetch.post('/api/api/myDoctor/deleteMyDoctorById', {}, { params: { id } });
}

export async function keywords() {
  const response = await fetch.get('/api/hotwords');
  return DoctorMapper.keywords(response.data);
}

export async function status(doctorId?: string) {
  const response = await fetch.get(`/api/doctor/${doctorId}/status`);
  return DoctorMapper.status(response.data);
}
