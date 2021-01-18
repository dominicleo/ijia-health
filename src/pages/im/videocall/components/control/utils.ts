import date from '@/utils/date';

export const getDurationText = (duration: number) => {
  return date.duration(duration, 'second').format('HH:mm:ss');
};
