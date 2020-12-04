type Channel = {
  /** 支付渠道标识 */
  code: string;
  /** 支付渠道名称 */
  name: string;
  /** 支付渠道图标 */
  icon: string;
};

export interface CashierQuery {
  /** 支付金额（分） */
  amount: number;
  /** 支付过期日期 */
  expire: number;
  /** 支付渠道 */
  channels: Channel[];
  /** 支付 Token */
  token: string;
}

export enum CASHIER_STATUS {
  /** 取消 */
  CANCELED = 'CANCELED',
  /** 支付中 */
  PENDING = 'PENDING',
  /** 支付成功 */
  PAYED = 'PAYED',
  /** 支付失败 */
  FAILED = 'PAY_FAILED',
}

export enum CASHIER_ORDER_STATUS {
  /** 创建 */
  CREATED = 'CREATED',
  /** 取消 */
  CANCELED = 'CANCELED',
  /** 超时 */
  TIMEOUT = 'TIMEOUT',
  /** 支付成功 */
  PAYED = 'PAYED',
  /** 部分退款中 */
  PART_REFUNDING = 'PART_REFUNDING',
  /** 部分退款 */
  PART_REFUNDED = 'PART_REFUNDED',
  /** 退款中 */
  REFUNDING = 'REFUNDING',
  /** 退款 */
  REFUNDED = 'REFUNDED',
  /** 退款失败 */
  REFUND_FAILED = 'REFUND_FAILED',
}

export interface CashierResult {
  /** 支付订单号 */
  orderId: string;
  /** 支付状态 */
  status: CASHIER_STATUS;
  /** 订单状态 */
  orderStatus: CASHIER_ORDER_STATUS;
  /** 支付时间 */
  paymentTime: number;
  /** 创建时间 */
  createdAt: number;
}

export interface CashierSubmitParams {
  /** 支付订单号 */
  orderId: string;
  /** 支付渠道 */
  channel: string;
  /** 微信用户授权凭证 */
  code: string;
  /** 支付 Token */
  token: string;
}

export interface CashierSubmitResponse {
  /** 支付流水号 */
  id: string;
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
