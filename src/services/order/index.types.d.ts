export enum ORDER_STATUS {
  NORMAL = 'NORMAL',
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
  /** 订单状态 */
  status: ORDER_STATUS;
  /** 订单支付状态 */
  paymentStatus: ORDER_PAYMENT_STATUS;
  /** 订单进度状态 */
  processStatus: ORDER_PROCESS_STATUS;
  /** 过期时间(秒) */
  expire: number;
}
