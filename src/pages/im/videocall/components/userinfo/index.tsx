import * as React from 'react';
import { CoverImage, CoverView } from 'remax/wechat';
import classnames from 'classnames';
import s from './index.less';
import { CALL_TYPE } from '../types.d';

const WAITING_TEXT = '正在等待对方接受邀请...';
const VOICDE_TEXT = '邀请你语音通话';
const VIDEO_TEXT = '邀请你视频通话';

interface UserInfoProps {
  /** 通话类型 */
  type: CALL_TYPE;
  /** 用户名 */
  name: string;
  /** 头像地址 */
  avatar: string;
  /** 是否被叫 */
  becalling?: boolean;
  /** 等待接听 */
  loading?: boolean;
}

const UserInfo: React.FC<UserInfoProps> = ({ type, name, avatar, becalling, loading }) => {
  const BECALLING_TEXT = type === CALL_TYPE.VOICE ? VOICDE_TEXT : VIDEO_TEXT;
  const message = becalling ? BECALLING_TEXT : WAITING_TEXT;

  return (
    <CoverView
      className={classnames(s.userinfo, s[type], {
        [s.hidden]: !loading && type === CALL_TYPE.VIDEO,
      })}
    >
      <CoverView className={s.name}>{name}</CoverView>
      {loading && <CoverView className={s.message}>{message}</CoverView>}
      <CoverView className={s.avatar}>
        <CoverImage src={avatar} />
      </CoverView>
    </CoverView>
  );
};

export default UserInfo;
