import { Doctor } from '../doctor/index.types';

export enum ARTICLE_TYPE {
  /** 文章 */
  COMMON = 'COMMON',
  /** 论文 */
  PAPER = 'PAPER',
}

export interface Article {
  /** 文章分类信息 */
  category: ArticleCategory;
  /** 关联医生信息 */
  doctor: Doctor;
  /** 文章 ID */
  id: number;
  /** 文章类型 */
  type: ARTICLE_TYPE;
  /** 文章标题 */
  title: string;
  /** 文章封面 */
  picture: string;
  /** 文章摘要 */
  summary: string;
  /** 文章内容 */
  content: string;
  /** 论文文件地址 */
  file: string;
  /** 是否为健康科普 */
  special: boolean;
  /** 阅读数量 */
  reads: number;
  /** 点赞状态 */
  like: boolean;
  /** 点赞数量 */
  likes: number;
  /** 分享数量 */
  shares: number;
  /** 发布时间 */
  date: string;
}

export interface ArticleCategory {
  /** 分类 ID */
  id: number;
  /** 分类名称 */
  name: string;
  /** 是否为健康科普 */
  special: boolean;
}

export interface HomepageArticleList {
  category: ArticleCategory;
  articles: Article[];
  /** 是否有更多文章 */
  more: boolean;
}
