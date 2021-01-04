import * as React from 'react';

import { NIM_MESSAGE_TYPE, NimRecord } from '@/utils/im';

import ChatingRecordNotice from './components/notice';
import ChatingRecordText from './components/text';
import ChatingRecordPatientInfo from './components/patient-info';
import ChatingRecordArticle from './components/article';
import ChatingRecordChartLet from './components/chartlet';
import ChatingRecordPrescribe from './components/prescribe';
import ChatingRecordImage from './components/image';
import ChatingRecordAudio from './components/audio';
import ChatingRecordVideo from './components/video';
import { MESSAGE_RECORD_CUSTOM_TYPE } from './components/types.d';
import s from './item.less';

const ChatingRecordItem: React.FC<NimRecord> = React.memo((props) => {
  const { type } = props;
  const isCustomMessage = type === NIM_MESSAGE_TYPE.CUSTOM;
  const customType = props?.content?.type;

  if (type === NIM_MESSAGE_TYPE.TEXT) {
    return <ChatingRecordText {...props} />;
  }
  if (type === NIM_MESSAGE_TYPE.IMAGE) {
    return <ChatingRecordImage {...props} />;
  }

  if (type === NIM_MESSAGE_TYPE.AUDIO) {
    return <ChatingRecordAudio {...props} />;
  }

  if (type === NIM_MESSAGE_TYPE.VIDEO) {
    return <ChatingRecordVideo {...props} />;
  }

  if (isCustomMessage && customType === MESSAGE_RECORD_CUSTOM_TYPE.PATIENTINFO) {
    return <ChatingRecordPatientInfo {...props} />;
  }

  if (isCustomMessage && customType === MESSAGE_RECORD_CUSTOM_TYPE.ARTICLE) {
    return <ChatingRecordArticle {...props} />;
  }

  if (isCustomMessage && customType === MESSAGE_RECORD_CUSTOM_TYPE.CHARTLET) {
    return <ChatingRecordChartLet {...props} />;
  }
  if (isCustomMessage && customType === MESSAGE_RECORD_CUSTOM_TYPE.PRESCRIBE) {
    return <ChatingRecordPrescribe {...props} />;
  }

  // 自定义推送消息
  if (
    isCustomMessage &&
    [
      MESSAGE_RECORD_CUSTOM_TYPE.REDPACKET,
      MESSAGE_RECORD_CUSTOM_TYPE.PAYRESULT,
      MESSAGE_RECORD_CUSTOM_TYPE.REDPACKETTIP,
      MESSAGE_RECORD_CUSTOM_TYPE.SETMEAL,
    ].includes(customType)
  ) {
    return <ChatingRecordNotice {...props} />;
  }

  // 未知消息类型，暂不处理

  return <></>;
});

export default ChatingRecordItem;
