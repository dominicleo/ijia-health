import { JSONParse } from '@/utils';
import date from '@/utils/date';
import createMapper from 'map-factory';

import { Message } from './index.types';

function messageMapper() {
  const mapper = createMapper();

  mapper
    .map()
    .keep(['id', 'type', 'title', 'content'])
    .map('extArgs')
    .to('params', JSONParse, {})
    .map('createTime')
    .to('date', (value: string) => date.removeTimezone(value).calendar());

  return mapper;
}

function query(source = []): Message[] {
  const mapper = createMapper();

  mapper.map('[]').to('[]', messageMapper().each);

  return mapper.execute(source);
}

const UserMapper = {
  query,
};

export default UserMapper;
