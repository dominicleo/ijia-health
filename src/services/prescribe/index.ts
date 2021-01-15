// @ts-ignore
import fetch from '@/utils/fetch';
import { AxiosPromise, AxiosRequestConfig } from 'axios';
import PrescribeMapper from './index.mapper';
import { isArray, isFunction, isJSONString, isPlainObject, JSONParse } from '@/utils';
import { getStorage, setStorage } from 'remax/wechat';

function dataMasking(value: string, startIndex: number, endIndex: number, separator = '*'): string {
  const maskingLength = value.length - startIndex;
  const DATA_MASKING_REG = new RegExp(
    `^(.{${startIndex}})(?:[\\d|\u4e00-\u9fa5]+)(.{${value.length - endIndex}})$`,
  );
  return value.replace(
    DATA_MASKING_REG,
    `$1${separator.repeat(value.length - startIndex - (value.length - endIndex))}$2`,
  );
}

interface RequestRequestConfig extends AxiosRequestConfig {
  isPatientId?: boolean;
}

interface Request {
  (config: RequestRequestConfig): AxiosPromise;
  get: (url: string, params?: any) => AxiosPromise;
  post: (url: string, data?: any, config?: AxiosRequestConfig) => AxiosPromise;
  put: (url: string, data?: any, config?: AxiosRequestConfig) => AxiosPromise;
}

const PATIENTID_KEY = 'PATIENT_ID';

const getPatient = async () => {
  const patientIdCache = await getStorage({ key: PATIENTID_KEY })
    .then((response) => response?.data)
    .catch(() => null);

  if (patientIdCache) {
    return patientIdCache;
  }

  const { patientId } = await fetch
    .post('/api/prescription/getPatient')
    .then((response) => (isPlainObject(response.data) ? response.data : {}));

  await setStorage({ key: PATIENTID_KEY, data: patientId }).catch(() => {});

  return patientId;
};

const request: Request = async (config) => {
  const { url, method = 'GET', params, data, isPatientId = true } = config;
  const query = method?.toLocaleUpperCase() === 'GET' ? params : data;
  let patientId: any;
  if (isPatientId) {
    patientId = await getPatient();
  }

  return fetch
    .post('/api/prescription/invoke', {
      endPoint: url,
      method,
      queryParam: {
        patientId,
        ...Object.assign({}, query),
      },
    })
    .catch((error: any) => {
      const { message } = error;
      if (isJSONString(message)) {
        error.message = JSONParse(message).msg || message;
      }
      throw error;
    });
};

request.get = (url, params) => request({ url, method: 'GET', params });
request.post = (url, data, config) => {
  return request({ ...Object.assign({}, config), url, method: 'POST', data });
};
request.put = (url, data, config) => {
  return request({ ...Object.assign({}, config), url, method: 'PUT', data });
};

export async function query(id: string) {
  const response = await request({
    url: `/prescription-core/prescription/getByPrescriId/${id}`,
    isPatientId: false,
  });
  return PrescribeMapper.prescribe(response.data);
}

export async function orderDetails(id: string) {
  const response = await request.get(`/drugstore/backstage/order/getByPrescription`, {
    prescriptionId: id,
  });
  return response.data;
}

interface GetListParams {
  /** (default: 1) 当前页数 */
  page: number;
  /** (default: 10) 每页数量 */
  pageSize: number;
}

export async function getList(params: GetListParams) {
  const { page = 1, pageSize = 10, ...restParams } = params;
  const response = await request.get('/drugstore/backstage/order/distributeList', {
    ...restParams,
    currentPage: page,
    pageSize,
  });
  return PrescribeMapper.orders(response.data);
}

/** 获取地址列表 */
export async function getAddressList(params: GetListParams) {
  const { page = 1, pageSize = 1000, ...restParams } = params;
  const response = await request.get('/patientcore/patient/address/list', {
    ...restParams,
    currentPage: page,
    pageSize,
  });
  return PrescribeMapper.adressComments(response.data?.data);
}

/** 获取地址列表 无分页 */
export async function getAllAddressList() {
  const response = await request({
    url: '/patientcore/patient/address/list/all',
  });
  return PrescribeMapper.adressComments(response.data);
}

/** 新增地址 */
interface AddressParams {
  /** 收货人姓名 */
  accepter: string;
  /**  地区id（accode） */
  areaId: any;
  /**  是否为默认地址 */
  isDefault: boolean;
  /** 收货人联系方式 */
  mobile: string;
  /**  街道，楼牌号等详细地址 */
  street: string;
  /** 前端定位地址 */
  position?: string;
}
/** 新增地址 */

export async function addAddress(params: AddressParams) {
  const response = await request.post('/patientcore/patient/address', params);
  console.log('response', response);

  return response;
}
/** 获取地址详情 */
export async function addressDetail(addressId: any) {
  const response = await request.get(`/patientcore/patient/address/list/${addressId}`, {});
  return response.data;
}
/** 编辑地址 */
export async function updateAddress(params: any) {
  const response = await request.put(`/patientcore/patient/address/list/${params.addressId}`, {
    ...params,
    addressId: undefined,
  });
  console.log('response编辑', response);

  return response;
}

interface ConfirmReceiptParams {
  /** 订单 ID */
  prescriptionId: string;
}
/*确认收货操作**/
export async function confirmReceipt(params: ConfirmReceiptParams) {
  const res = await request.get('/drugstore/backstage/order/confirmReceipt', params);
  return res.data;
}
/*推荐药店列表**/
export async function recommendStoreList(params: any) {
  const response = await request.get(`/drugstore/store/recommendStoreList`, params);
  return response.data;
}

/***/
export async function getExpressReturn(params: any) {
  const response = await request.get(`/drugstore/backstage/order/getExpressReturn`, params);
  return response.data;
}

/*订单详情**/

export async function orderDetail(id: string) {
  const response = await request.get(`/drugstore/backstage/order/getOrderInfoByPrescription`, {
    prescriptionId: id,
  });
  return response.data;
}

/*处方详情**/
export async function getByPrescriId(params: any) {
  const response = await request({
    url: `/prescription-core/prescription/getByPrescriId/${params.id}`,
    isPatientId: false,
  });
  return response.data;
}

/*医疗编码**/
export async function getHospitalInfo(params: any) {
  const response = await request.get(
    `/prescription-core/hospitalInfo/getHospitalInfo/${params.id}`,
    {},
  );
  return response.data;
}

function formatArea(data: any[], callback?: any) {
  const targets: any = {};
  const areas = isArray(data) ? data : [];
  areas.forEach((area) => {
    const id = String(area.areaId).padEnd(6, '0');
    targets[id] = area.name;
    isFunction(callback) && callback(area.children);
  });
  return targets;
}

export async function getArea() {
  const response = await request.get('/patientcore/area/all');
  const areas = isArray(response.data) ? response.data : [];
  const data: any = {};
  data.province_list = formatArea(areas, (citys: any) => {
    data.city_list = Object.assign(
      {},
      data.city_list,
      formatArea(citys, (countys: any) => {
        data.county_list = Object.assign({}, data.county_list, formatArea(countys));
      }),
    );
  });

  data.source = {};

  Object.keys(data.county_list).forEach((key) => {
    if (String(key).length === 9) {
      const originalId = dataMasking(String(key), 3, 6, '');
      data.source[originalId] = key;
      data.county_list[originalId] = data.county_list[key];
      delete data.county_list[key];
    }
  });

  return data;
}

export async function paymentChannels(storeId: number) {
  const response = await request.get('/pay-core/pay/getPayMethodChannel', {
    storeId,
  });
  return PrescribeMapper.paymentChannels(response.data);
}

interface GetPharmacyListParams {
  /** 处方 ID */
  id: string;
  /** 排序 */
  sort: any;
  /** 配送方式 */
  delivery: number;
  /** 经度 */
  longitude: number;
  /** 纬度 */
  latitude: number;
}

export async function getPharmacyList(params: GetPharmacyListParams) {
  const { sort, ...restParams } = params;
  const response = await request.get('/drugstore/store/listByLongAndLatAndPrescriptionId', {
    select: sort,
    ...restParams,
  });
  return PrescribeMapper.pharmacys(response.data);
}

export async function getOrderDetials(id: string) {
  const response = await request.get(`/distribute-core/distribute/orderDetatil/${id}`);
  return PrescribeMapper.orderDetails(response.data);
}

export async function payment(params: any) {
  const response = await request.post('/pay-core/pay/getH5AliPayInfo', params);
  return response.data;
}

export async function confirm(params: any) {
  return request.post('/drugstore/backstage/order/placeOrder', params);
}

export async function getOpenId() {
  const response = await fetch.post('/api/wechat/app/getOpenId');
  return response.data;
}

export async function checkOrderIsPay(prescriptionId: string) {
  const response = await request({
    url: '/drugstore/backstage/order/checkOrderIsPay',
    isPatientId: false,
    params: { prescriptionId },
  });
  return response.data;
}
