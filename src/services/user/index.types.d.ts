export interface Authorize {
  /** 用户令牌 */
  token: string;
  /** 手机号 */
  mobile: number;
}

export interface AuthorizeParams {
  /** 用户登录凭证 */
  code: string;
  /** 完整用户信息的加密数据 */
  encryptedData: string;
  /** 加密算法的初始向量 */
  iv: string;
}

export interface UserInfo {
  /** 姓名 */
  name: string;
  /** 身份证号 */
  idCardNumber: string;
  /** 手机号 */
  phoneNumber: string;
}

export interface YunxinConfig {
  account: string;
  token: string;
}
