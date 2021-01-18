/** answer */
import AnswerImageNormal from './images/answer.png';
import AnswerImageHover from './images/answer-hover.png';
import AnswerImageActive from './images/answer-active.png';
/** videoup */
import VideoupImageNormal from './images/videoup.png';
import VideoupImageHover from './images/videoup-hover.png';
import VideoupImageActive from './images/videoup-active.png';
/** hangup */
import HangupImageNormal from './images/hangup.png';
import HangupImageHover from './images/hangup-hover.png';
import HangupImageActive from './images/hangup-active.png';
/** mute */
import MuteImageNormal from './images/mute.png';
import MuteImageHover from './images/mute-hover.png';
import MuteImageActive from './images/mute-active.png';
/** handsfree */
import HandsfreeImageNormal from './images/handsfree.png';
import HandsfreeImageHover from './images/handsfree-hover.png';
import HandsfreeImageActive from './images/handsfree-active.png';
/** cutcamera */
import CutcameraImageNormal from './images/cutcamera.png';
/** cutvoice */
import CutvoiceImageNormal from './images/cutvoice.png';
import CutvoiceImageHover from './images/cutvoice-hover.png';
import CutvoiceImageActive from './images/cutvoice-active.png';
/** icon-cutvoice */
import IconCutvoiceImageNormal from './images/icon-cutvoice.png';
import IconCutvoiceImageHover from './images/icon-cutvoice-hover.png';
import { CONTROL_TYPE } from '../types';

type ControlStatus = {
  normal: string;
  hover: string;
  active: string;
};

const HANGUP = {
  normal: HangupImageNormal,
  hover: HangupImageHover,
  active: HangupImageActive,
};

const CONTROL: Record<CONTROL_TYPE, ControlStatus> = {
  answer: {
    normal: AnswerImageNormal,
    hover: AnswerImageHover,
    active: AnswerImageActive,
  },
  videoup: {
    normal: VideoupImageNormal,
    hover: VideoupImageHover,
    active: VideoupImageActive,
  },
  hangup: HANGUP,
  cancel: HANGUP,
  mute: {
    normal: MuteImageNormal,
    hover: MuteImageHover,
    active: MuteImageActive,
  },
  handsfree: {
    normal: HandsfreeImageNormal,
    hover: HandsfreeImageHover,
    active: HandsfreeImageActive,
  },
  cutcamera: {
    normal: CutcameraImageNormal,
    hover: CutcameraImageNormal,
    active: CutcameraImageNormal,
  },
  cutvoice: {
    normal: CutvoiceImageNormal,
    hover: CutvoiceImageHover,
    active: CutvoiceImageActive,
  },
  'icon-cutvoice': {
    normal: IconCutvoiceImageNormal,
    hover: IconCutvoiceImageHover,
    active: IconCutvoiceImageHover,
  },
};

const ANSWER_TEXT = '接听';
const CUTVOICE_TEXT = '切到语音通话';

export const CONTROL_TEXT: { [key in CONTROL_TYPE]: string } = {
  answer: ANSWER_TEXT,
  videoup: ANSWER_TEXT,
  hangup: '挂断',
  cancel: '取消',
  mute: '静音',
  handsfree: '免提',
  cutcamera: '切换摄像头',
  cutvoice: CUTVOICE_TEXT,
  'icon-cutvoice': CUTVOICE_TEXT,
};

export default CONTROL;
