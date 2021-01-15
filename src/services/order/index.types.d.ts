import { Doctor } from '../doctor/index.types';

export enum ORDER_STATUS {
  NORMAL = 'NORMAL',
  CANCEL = 'CANCEL',
}

export enum ORDER_PAYMENT_STATUS {
  PAYED = 'PAYED',
}

export enum ORDER_PROCESS_STATUS {
  UN_RECEPTION = 'UN_RECEPTION',
}

export interface Order {
  /** 订单 ID */
  id: string;
  /** 支付金额 */
  amount: number;
  /** 订单状态 */
  status: ORDER_STATUS;
  /** 订单支付状态 */
  paymentStatus: ORDER_PAYMENT_STATUS;
  /** 订单进度状态 */
  processStatus: ORDER_PROCESS_STATUS;
  /** 支付过期时间(时间戳) */
  paymentExpire: number;
  /** 过期时间(秒) */
  expire: number;
  /** 商品名称 */
  goodsName: string;
  /** 创建时间 */
  createdAt: string;
}

export interface CreateOrderParams {
  /** 商品 ID */
  goodsId: number;
  /** 价格 */
  price: number;
  /** 医生信息 */
  doctor: Pick<
    Doctor,
    'id' | 'name' | 'avatar' | 'hospitalId' | 'hospitalName' | 'departmentId' | 'departmentName'
  >;
}

export interface CreateOrderResponse {
  /** 是否需要支付 */
  callback: boolean;
  params: {
    /** 随机字符串 */
    nonceStr: string;
    /** 签名算法 */
    signType: 'MD5' | 'HMAC-SHA256';
    /** 签名 */
    paySign: string;
    /** 时间戳 */
    timeStamp: string;
    /** 统一下单接口返回的 prepay_id 参数值 */
    package: string;
  };
}
