import fetch from '@/utils/fetch';

import HelpMapper from './index.mapper';

export async function query(id: string) {
  const response = await fetch.post('/api/app/help/content', null, { params: { titleId: id } });
  return HelpMapper.query(response.data);
}

export async function getList() {
  const response = await fetch.post('/api/app/help/titles?typeCode=3001');
  return HelpMapper.getList(response.data);
}
