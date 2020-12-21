import * as React from 'react';
import { CoverImage, CoverView, View, TouchEvent } from 'remax/wechat';
import classnames from 'classnames';
import s from './index.less';
import { CALL_TYPE } from '../types.d';
import AnswerImage from './images/answer.svg';

interface ControlProps {
  /** 通话类型 */
  type: CALL_TYPE;
  /** (default: false) 静音状态 */
  mute?: boolean;
  /** (default: false) 免提 */
  handsfree?: boolean;
  /** 是否被叫 */
  becalling?: boolean;
  /** 等待接听 */
  loading?: boolean;
  /** 点击接听 */
  onAnswer?: (event?: TouchEvent) => void;
  /** 点击取消 */
  onCancel?: (event?: TouchEvent) => void;
  /** 点击挂断 */
  onHangup?: (event?: TouchEvent) => void;
  /** 点击免提 */
  onHandsfree?: (event?: TouchEvent) => void;
  /** 点击静音 */
  onMute?: (event?: TouchEvent) => void;
  /** 切换到语音 */
  onSwitchVoice?: (event?: TouchEvent) => void;
}

const Control: React.FC<ControlProps> = ({ type }) => {
  return (
    <CoverView className={classnames(s.control)}>
      <CoverView className={s.item}>
        <CoverImage src={AnswerImage} />
      </CoverView>
    </CoverView>
  );
};

export default Control;
