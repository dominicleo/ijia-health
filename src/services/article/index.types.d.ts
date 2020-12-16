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
  /** 阅读数量 */
  reads: number;
  /** 点赞状态 */
  like: boolean;
  /** 点赞数量 */
  likes: number;
  /** 分享数量 */
  shares: number;
  /** 是否收藏 */
  bookmark: boolean;
  /** 是否可以打赏 */
  reward: boolean;
  /** 推荐文章列表 */
  articles?: Article[];
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

export interface ArticleList {
  list: Article[];
  categories?: ArticleCategory[];
  pagination: {
    /** 当前页码 */
    current: number;
    /** 每页数量 */
    pageSize: number;
    /** 总条数 */
    total: number;
  };
}

export interface HomepageArticleList {
  category: ArticleCategory;
  articles: Article[];
  /** 是否有更多文章 */
  more: boolean;
}

export interface ArticleGetListParams {
  /** 文章类别 ID */
  categoryId?: string;
  /** 文章类型 */
  type?: ARTICLE_TYPE;
  /** 搜索关键字 */
  keyword?: string;
  /** (default: 1) 页码 */
  page?: number;
  /** (default: 10) 每页数量 */
  size?: number;
}
