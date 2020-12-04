export interface Doctor {
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
}
