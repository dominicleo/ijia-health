export interface Doctor {
  /** 数据 ID */
  sourceId: number;
  /** 医生 ID */
  id: string;
  /** 医生头像 */
  avatar: string;
  /** 医生名称 */
  name: string;
  /** 医生职称 */
  officer: string;
  /** 医院 ID */
  hospitalId: string;
  /** 医院名称 */
  hospitalName: string;
  /** 科室 ID */
  departmentId: string;
  /** 科室名称 */
  departmentName: string;
  /** 关注 */
  follow: boolean;
  /** 关注人数 */
  followNumber: number;
  /** 医生所在医院地址 */
  address: string;
  /** 创建时间 */
  createdAt: number;
  /** 云信账号 */
  account: string;
}

export interface GetMyDoctorListParams {
  /** (default: 1) 页码 */
  page?: number;
  /** (default: 10) 每页数量 */
  size?: number;
}
