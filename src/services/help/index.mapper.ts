import createMapper from 'map-factory';

import { Help, HelpItem } from './index.types';

function query(source = {}): Help {
  const mapper = createMapper();

  mapper.map('content');

  return mapper.execute(source);
}

function getList(source = []): HelpItem[] {
  const mapper = createMapper();

  mapper.map('[]').to('[]');

  return mapper.execute(source);
}

const DoctorMapper = {
  query,
  getList,
};

export default DoctorMapper;
