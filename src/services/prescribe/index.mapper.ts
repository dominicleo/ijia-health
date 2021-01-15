import createMapping from 'map-factory';
import dayjs from '@/utils/date';
import { isArray, isString } from '@/utils';
import { PrescribeList } from './index.types';

function prescribe(data = {}) {
  const original = Object.assign({}, data);
  const mapper = createMapping();

  mapper
    .map('paymentType')
    .to('paymentStatus', (value: any) => parseFloat(value))
    .map('patientName')
    .map('patientMobile')
    .map('fromStatus')
    .map('stateOrigin', (value: any) => parseInt(value))
    .map()
    .to('source');

  return mapper.execute(original);
}

function orderMapper() {
  const mapper = createMapping();
  mapper
    .map('id')
    .map('prescriptionId')
    .map('orderStatus')
    .to('status')
    .map()
    .to('statusText', (value: any) => {
      // -1:取消,0:待支付,1:已支付,2:申请退款,3退款成功,4退款失败,5部分退款,6全部退款
      if (value?.payStatus === -1) {
        return '已取消';
      }
      if (value?.payStatus === 0) {
        return '待支付';
      }
      if (value?.payStatus === 5) {
        return '部分退款';
      }
      if (value?.payStatus === 6) {
        return '全部退款';
      }
      if (value?.orderStatus === 0 && value?.type === 1) {
        return '待取药';
      }
      if (value?.orderStatus === 0 && value?.type === 2) {
        return '待发货';
      }
      if (value?.orderStatus === 1) {
        return '待收货';
      }
      if (value?.orderStatus === 2) {
        return '已完成';
      }
    })
    .map('prescriptionDto.applyDoctorDepartmentName')
    .to('departmentName')
    .map('prescriptionDto.applyDoctorHospitalName')
    .to('hospitalName')
    .map('prescriptionDto.applyDoctorName')
    .to('doctorName')
    .map('prescriptionDto.applyDoctorHeadimg')
    .to('doctorAvatar')
    .map('prescriptionDto.conclusion')
    .to('conclusion')
    .map('prescriptionDto.prescriptionDto')
    .to('stateOrigin', (value: any) => parseInt(value))
    .map('prescriptionDto.addtime')
    .to('createdAt', (value: any) => dayjs(value * 1000).format('L LT'))
    .map('payStatus')
    .to('paymentStatus')
    .map('orderDetails')
    .map('prescriptionDto');
  return mapper;
}

function orders(source = {}): PrescribeList {
  const mapper = createMapping();

  mapper
    .map('data')
    .to('list', orderMapper().each, [])
    .map('currentPage')
    .to('pagination.current')
    .map('pageSize')
    .to('pagination.pageSize')
    .map('totalCount')
    .to('pagination.total');

  return mapper.execute(source);
}

/**地址列表 */
interface ADDRESS {
  /**收货人姓名 */
  accepter: string;
  /** 收货人id */
  patientId: string;
  /** 省市区 */
  areaName: string;
  /** 省市区Id(六位) */
  areaId: number;
  /** 是否为默认地址 */
  isDefault: boolean;
  /** 手机号 */
  mobile: string;
  /**街道，楼牌号，详细地址  */
  street: string;
  /**  唯一标识*/
  addressId: number;
}

function adressComments(data: any[] = []): ADDRESS[] {
  const original = isArray(data) ? data : [];
  const mapper = createMapping();
  return mapper
    .map('[].accepter')
    .map('[].patientId')
    .map('[].areaName')
    .map('[].areaId')
    .map('[].isDefault')
    .map('[].mobile')
    .map('[].street')
    .map('[].addressId')
    .execute(original);
}

const DELIVERY_TEXT: any = {
  1: '快递',
  2: '自提',
};

function drugMapper() {
  const mapper = createMapping();

  mapper
    .map('id')
    .map('name')
    .map('commonName')
    .map('cover')
    .to('picture')
    .map('specName')
    .map('count');

  return mapper;
}

function pharmacyMapper() {
  const mapper = createMapping();
  mapper
    .map('id')
    .map('name')
    .map('distance')
    .map('star')
    .to('score')
    .map('cover')
    .to('picture')
    .map()
    .to('delivery', (value: any) => {
      const data = isString(value?.delivery) ? value.delivery : '';
      return data.split(',');
    })
    .map()
    .to('deliveryText', (value: any) => {
      const data = isString(value?.delivery) ? value.delivery : '';
      return data
        .split(',')
        .map((index: any) => DELIVERY_TEXT[index])
        .filter(Boolean);
    })
    .map('medicineDTOList')
    .to('drugs', (value: any) => drugMapper().each(value))
    .map()
    .to('source');

  return mapper;
}

interface Drug {
  /** 药品 ID */
  id: string;
  /** 药品名称 */
  name: string;
  /** 通用名称 */
  commonName: string;
  /** 图片 */
  picture: string;
  /** 数量 */
  count: number;
  /** 规格 */
  specName: string;
}

interface Pharmacy {
  /** 药店 ID */
  id: string;
  /** 药店名字 */
  name: string;
  /** 药店图片 */
  picture: string;
  /** 支持配送方式 */
  delivery: number[];
  /** 支持配送方式 */
  deliveryText: string[];
  /** 距离 */
  distance: number;
  /** 评分 */
  score: number;
  /** 是否包含所有药品 */
  isContainAll: boolean;
  /** 备注 */
  remark: string;
  /** 包含药品列表 */
  drugs: Drug[];
}

function pharmacys(data: any = []): Pharmacy[] {
  const original = isArray(data) ? data : [];
  const mapper = createMapping();

  mapper.map('[]').to('[]', (value: any) => pharmacyMapper().each(value));

  return mapper.execute(original);
}

function orderDetails(data = {}) {
  const original = Object.assign({}, data);
  const mapper = createMapping();

  return mapper.execute(original);
}

function paymentChannels(data: any[] = []) {
  const mapper = createMapping();
  const original = isArray(data) ? data : [];

  mapper.map('id').map('name').map('logo').map('channel');

  return mapper.each(original);
}

const PrescribeMapper = {
  orders,
  adressComments,
  pharmacys,
  prescribe,
  orderDetails,
  paymentChannels,
};

export default PrescribeMapper;
