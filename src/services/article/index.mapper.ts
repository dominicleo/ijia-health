import createMapper from 'map-factory';

import { isArray } from '@/utils';
import date from '@/utils/date';

import { Article, ArticleList, HomepageArticleList } from './index.types';

function doctorMapper() {
  const mapper = createMapper();

  mapper
    .map('doctorid')
    .to('id')
    .map('truename')
    .to('name')
    .map('headimg')
    .to('avatar')
    .map('hospitalid')
    .to('hospitalId')
    .map('hospitalName')
    .map('departmentid')
    .to('departmentId')
    .map('departmentName')
    .map('officer')
    .map('follow')
    .map('followNum')
    .to('followNumber', undefined, () => 0);

  return mapper;
}

function categoryMapper() {
  const mapper = createMapper();

  mapper
    .map('id')
    .map('name')
    .map('special')
    .to(
      'special',
      (value: any) => !!value,
      () => false,
    );

  return mapper;
}

function articleMapper() {
  const mapper = createMapper();

  mapper
    .map('id')
    .map('type')
    .map('name')
    .map('title')
    .or('cnTitle')
    .to('title')
    .map('content')
    .or('cnContent')
    .to('content')
    .map('coverUrl')
    .to('picture')
    .map('category')
    .or('articleCategory')
    .to('category', categoryMapper().execute, {})
    .map('doctor')
    .to('doctor', doctorMapper().execute, {})
    .map('like')
    .to('like', undefined, () => false)
    .map('likes')
    .to('likes', undefined, () => 0)
    .map('shares')
    .to('shares', undefined, () => 0)
    .map('reads')
    .to('reads', undefined, () => 0)
    .map('reward')
    .to('reward', undefined, () => false)
    .map('bookmark')
    .to('bookmark', undefined, () => false)
    .map('paper')
    .to('file')
    .map('createTime')
    .to('date', (value: any) => date.removeTimezone(value).format('LL'));

  return mapper;
}

function articles(source = []): Article[] {
  const mapper = createMapper();

  mapper.map('[]').to('[]', articleMapper().each, []);

  return mapper.execute(source);
}

function query(source = {}): Article {
  const mapper = createMapper();

  const article = articleMapper().execute(source);

  mapper.map('hotArticleBOs').to('articles', articleMapper().each, []);

  return mapper.execute(source, article);
}

function getList(source = {}): ArticleList {
  const mapper = createMapper();

  mapper
    .map('articles')
    .to('list', articleMapper().each, [])
    .map('categories')
    .to('categories', categoryMapper().each, [])
    .map('currentPage')
    .to('pagination.current')
    .map('size')
    .to('pagination.pageSize')
    .map('total')
    .to('pagination.total');

  return mapper.execute(source);
}

function homepage(source = []): HomepageArticleList[] {
  const mapper = createMapper();

  mapper
    .map('[].category')
    .to('[].category', categoryMapper().each, {})
    .map('[].articles')
    .to('[].articles', (articles: any) =>
      isArray(articles) ? articles.map(articleMapper().each) : [],
    )
    .map('[].more');

  return mapper.execute(source);
}

const ArticleMapper = {
  articles,
  query,
  getList,
  homepage,
};

export default ArticleMapper;
