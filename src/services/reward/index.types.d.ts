import { Doctor } from '../doctor/index.types';

interface Gift {
  /** 礼物数量 */
  count: number;
  /** 礼物封面 */
  image: string;
  /** 显示名称 */
  text: string;
}

export interface RewardQuery {
  /** 图片地址 */
  banner: string;
  /** 打赏礼物数据 */
  gifts: Gift[];
  /** 医生信息 */
  doctor: Doctor;
}

export interface RewardSubmitParams {
  /** 文章 ID */
  articleId?: string;
  /** 打赏商品 ID */
  goodsId: number;
  /** 打赏数量 */
  count: number;
  [key: string]: any;
}
