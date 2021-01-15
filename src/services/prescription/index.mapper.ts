import createMapping from 'map-factory';
import { chooseInvoiceTitle } from 'remax/wechat';
import { isFunction, isArray, isNumber, uniqueBySet, isPlainObject } from '@/utils';

function pharmacyMapper(data: any = {}) {
  const mapper = createMapping();
  const original = Object.assign({}, data);

  mapper
    .map('storeId')
    .to('id')
    .map('storeName')
    .to('name')
    .map('storeMobile')
    .to('telephone')
    .map('storeAddress')
    .to('address');

  return mapper.execute(original);
}

function drugMapper(data: any = {}) {
  const mapper = createMapping();
  const original = Object.assign({}, data);

  mapper
    .map('storeId')
    .map('storeName')
    .map('completeTime')
    .to('completeTime', (value: any) => (isNumber(value) ? value * 1000 : null))
    .map('drugId')
    .to('id')
    .map('commonName')
    .map('drugName')
    .to('name')
    .map('drugImage')
    .to('picture')
    .map('drugPrice')
    .to('price')
    .map('drugCount')
    .to('count')
    .map('drugCountUnit')
    .to('unit')
    .map()
    .to('instructions', ({ drugSpec, frequency, phr, usaged }: any) => {
      return [drugSpec, frequency, phr, usaged].filter(Boolean).join(' ');
    });

  return mapper.execute(original);
}

function details(data: any = {}) {
  const mapper = createMapping();
  const original = Object.assign({}, data);

  mapper.map('prescriptionId').map('status').map('owner');

  // 用户信息
  mapper
    .map('prescriptionOrder.patientMobile')
    .to('userinfo.mobile')
    .map('prescriptionOrder.patientName')
    .to('userinfo.name')
    .map('prescription.patientIdentityId')
    .to('userinfo.idCardNumber');

  // 医生信息
  mapper
    .map('prescription.applyDoctorAccid')
    .to('doctor.account')
    .map('prescriptionOrder.doctorId')
    .to('doctor.doctorId')
    .map('prescriptionOrder.doctorName')
    .to('doctor.doctorName')
    .map('prescriptionOrder.hospitalId')
    .to('doctor.hospitalId')
    .map('prescriptionOrder.hospitalName')
    .to('doctor.hospitalName');

  // 订单信息
  mapper
    .map('prescriptionOrder.id')
    .to('id')
    .map('prescription.orderNumber')
    .to('orderNumber')
    .map('prescriptionOrder.barcode')
    .to('code')
    .map('prescription.medicineCode')
    .to('medicineCode')
    .map('prescriptionOrder.qrcode')
    .to('qrcode')
    .map('prescriptionOrder.codeUsed')
    .to('used')
    .map('prescription.totalPrice')
    .to('price')
    .map('prescriptionOrder.payStatus')
    .to('paymentStatus')
    .map('prescriptionOrder.payType')
    .to('paymentType')
    .map('prescriptionOrder.payTime')
    .to('paymentTime', (value: any) => (isNumber(value) ? value * 1000 : null));

  mapper
    .map('prescriptionOrder.childList')
    .to('count', (items: any[]) =>
      isArray(items)
        ? items.reduce((total: number, current: any) => total + current.drugCount ?? 0, 0)
        : 0,
    );

  mapper.map('prescriptionOrder.childList').to('drugs', (items: any[]) => {
    const drugs = isArray(items) ? items.map((item) => drugMapper(item)) : [];
    return drugs;
  });

  mapper.map('prescriptionOrder.childList').to('pharmacy', (items: any[]) => {
    const drugs = isArray(items) ? items.map((item) => drugMapper(item)) : [];
    const pharmacyIds = isArray(items) ? uniqueBySet(items.map(({ storeId }) => storeId)) : [];

    const pharmacy: any[] = [];

    pharmacyIds.forEach((id: string) => {
      let store = items.find((item) => item.storeId === id);
      if (isPlainObject(store)) {
        store = pharmacyMapper(store);
        store.drugs = drugs.filter(({ storeId }) => storeId === store.id);
        pharmacy.push(store);
      }
    });

    return pharmacy;
  });

  return mapper.execute(original);
}

function paymentChannels(data: any[] = []) {
  const mapper = createMapping();
  const original = isArray(data) ? data : [];

  mapper.map('id').map('name').map('logo').map('channel');

  return mapper.each(original);
}

const PrescriptionMapper = {
  details,
  paymentChannels,
};

export default PrescriptionMapper;
