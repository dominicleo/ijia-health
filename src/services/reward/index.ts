import fetch from '@/utils/fetch';

import RewardMapper from './index.mapper';
import { RewardSubmitParams } from './index.types';

export const query = async (doctorId: string) => {
  const response = await fetch.post('/api/api/reward/getRewardInfo', null, {
    params: { doctorId },
  });
  return RewardMapper.query(response.data);
};

export const submit = async (params: RewardSubmitParams) => {
  const response = await fetch.post('/api/api/reward/getRewardInfo', params);
  return response.data;
};
