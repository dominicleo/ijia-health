import fetch from '@/utils/fetch';

import RewardMapper from './index.mapper';
import { RewardSubmitParams } from './index.types';

export const query = async (articleId: string) => {
  const response = await fetch.post('/api/api/reward/getRewardInfo/v2', null, {
    params: { sourceType: 'ARTICLE', sourceId: articleId },
  });
  return RewardMapper.query(response.data);
};

export const submit = async (params: RewardSubmitParams) => {
  const response = await fetch.post('/api/api/reward/getRewardInfo/v2', params);
  return response.data;
};
