import fetch from '@/utils/fetch';

import RewardMapper from './index.mapper';

export const query = async (doctorId: string) => {
  const response = await fetch.post('/api/api/reward/getRewardInfo', null, {
    params: { doctorId },
  });
  return RewardMapper.query(response.data);
};
