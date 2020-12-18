import date from '@/utils/date';
import createMapper from 'map-factory';
import { CommentList } from './index.types';

function commentMapper() {
  const mapper = createMapper();

  mapper
    .map('id')
    .map('name')
    .map('avatar')
    .map('content')
    .map('createTime')
    .to('date', (value: any) => date.removeTimezone(value).calendar());

  return mapper;
}

function getList(source = {}): CommentList {
  const mapper = createMapper();

  mapper
    .map('list')
    .to('list', commentMapper().each, [])
    .map('currentPage')
    .to('pagination.current')
    .map('size')
    .to('pagination.pageSize')
    .map('totalRows')
    .to('pagination.total');

  return mapper.execute(source);
}

const CommentMapper = {
  getList,
};

export default CommentMapper;
