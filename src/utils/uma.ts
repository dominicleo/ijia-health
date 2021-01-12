import uma from 'umtrack-wx';
import { UMENG_APPKEY } from '@/constants/common';

uma.init({
  appKey: UMENG_APPKEY,
  useOpenid: false,
  autoGetOpenid: false,
  debug: false,
});

export default uma;
