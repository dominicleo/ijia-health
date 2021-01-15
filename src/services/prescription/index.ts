import fetch from '@/utils/fetch';
import PrescriptionMapper from './index.mapper';

export async function query(id: string) {
  const response = await fetch(`/api/prescription/${id}/pay`);

  return PrescriptionMapper.details(response.data);
}

export async function status(id: string) {
  const response = await fetch(`/api/prescription/${id}/pay/status`);
  return PrescriptionMapper.details(response.data);
}

export function sendCaptcha(params: any) {
  return fetch.post(`/api/prescription/user/getValidationCode`, params);
}

export function register(params: any) {
  return fetch.post(`/api/prescription/user/bindToMobile`, params);
}

export async function bindStatus(id: string) {
  const response = await fetch.post(
    '/api/prescription/user/bind',
    {},
    { params: { prescriptionId: id } },
  );
  return response.data;
}

export async function bindToMe(id: string) {
  return fetch.post('/api/prescription/user/bindToMe', { prescriptionId: id });
}

export async function paymentChannels(code: string) {
  const response = await fetch.get(`/api/pay/merchant/code/${code}/supportedChannels`);
  return PrescriptionMapper.paymentChannels(response.data);
}

export async function payment(params: any) {
  const response = await fetch.post('/api/pay/prescription', params);
  return response.data;
}
