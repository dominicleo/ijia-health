import * as React from 'react';

import { NIM_MESSAGE_TYPE, NimRecord, NimAudioFile, NimImageFile, NimVideoFile } from '@/utils/im';

import ChatingRecordArticle from './components/article';
import ChatingRecordAudio from './components/audio';
import ChatingRecordChartLet from './components/chartlet';
import ChatingRecordImage from './components/image';
import ChatingRecordNotice from './components/notice';
import ChatingRecordPatientInfo from './components/patient-info';
import ChatingRecordPrescription from './components/prescription';
import ChatingRecordText from './components/text';
import ChatingRecordNetcall from './components/netcall';
import { MESSAGE_RECORD_CUSTOM_TYPE } from './components/types.d';
import ChatingRecordVideo from './components/video';
import s from './item.less';

const ChatingRecordItem: React.FC<NimRecord> = React.memo((props) => {
  const { type, attach } = props;
  const isCustomMessage = type === NIM_MESSAGE_TYPE.CUSTOM;
  const isNotificationMessage = type === NIM_MESSAGE_TYPE.NOTIFICATION;
  const customType = props?.content?.type;

  if (type === NIM_MESSAGE_TYPE.TEXT) {
    return <ChatingRecordText {...props} />;
  }
  if (type === NIM_MESSAGE_TYPE.IMAGE) {
    return <ChatingRecordImage {...(props as NimRecord<NimImageFile>)} />;
  }

  if (type === NIM_MESSAGE_TYPE.AUDIO) {
    return <ChatingRecordAudio {...(props as NimRecord<NimAudioFile>)} />;
  }

  if (type === NIM_MESSAGE_TYPE.VIDEO) {
    return <ChatingRecordVideo {...(props as NimRecord<NimVideoFile>)} />;
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
    return <ChatingRecordPrescription {...props} />;
  }

  if (isNotificationMessage && /netcallMiss|netcallBill/.test(attach?.type || '')) {
    return <ChatingRecordNetcall {...props} />;
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

  console.log('未处理消息', props);

  return <></>;
});

export default ChatingRecordItem;
