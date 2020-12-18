import { ArticleId } from '../article/index.types';

export interface Comment {
  /** 评论 ID */
  id: number;
  /** 用户名 */
  name: string;
  /** 头像 */
  avatar: string;
  /** 评论内容 */
  content: string;
  /** 评论时间 */
  date: string;
}

export interface CommentList {
  list: Comment[];
  pagination: {
    /** 当前页码 */
    current: number;
    /** 每页数量 */
    pageSize: number;
    /** 总条数 */
    total: number;
  };
}

export interface CommentGetListParams {
  /** 文章 ID */
  articleId: ArticleId;
  /** (default: 1) 页码 */
  page?: number;
  /** (default: 10) 每页数量 */
  size?: number;
}

export interface CommentSubmitParams {
  /** 文章 ID */
  articleId: ArticleId;
  /** 评论内容 */
  content: string;
}

export interface CommentReportParams {
  /** 举报类型 */
  type: string | number;
  /** 评论 ID */
  commentId: number;
}
