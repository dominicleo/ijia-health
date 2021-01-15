export interface Prescribe {
  /** 订单 ID */
  id: string;
  /** 处方笺 ID */
  prescriptionId: string;
  /** 医生名称 */
  doctorName: string;
  /** 医生头像 */
  doctorAvatar: string;
  /** 医院名称 */
  hospitalName: string;
  /** 科室名称 */
  departmentName: string;
  /** 诊断内容 */
  conclusion: string;
  /** 订单状态 */
  status: number;
  /** 订单状态文字 */
  statusText: string;
  /** 支付状态 */
  paymentStatus: number;
  /** 创建时间 */
  createdAt: string;
  /** 订单详情 */
  orderDetails: any[];
  /** 处方来源 */
  stateOrigin: any;
}

export interface PrescribeList {
  list: Prescribe[];
  pagination: {
    /** 当前页码 */
    current: number;
    /** 每页数量 */
    pageSize: number;
    /** 总条数 */
    total: number;
  };
}
