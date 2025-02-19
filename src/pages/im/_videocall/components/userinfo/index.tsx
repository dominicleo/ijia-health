import classnames from 'classnames';
import * as React from 'react';
import { CoverImage, CoverView } from 'remax/wechat';

import { NETCALL_TYPE } from '@/utils/im';

import s from './index.less';

const WAITING_TEXT = '正在等待对方接受邀请...';
const VOICDE_TEXT = '邀请你语音通话';
const VIDEO_TEXT = '邀请你视频通话';

interface UserInfoProps {
  /** 通话类型 */
  type: NETCALL_TYPE;
  /** 用户名 */
  name: string;
  /** 头像地址 */
  avatar: string;
  /** 是否被叫 */
  becalling?: boolean;
  /** 是否等待接听中 */
  loading?: boolean;
}

const UserInfo: React.FC<UserInfoProps> = React.memo(
  ({ type, name, avatar, becalling, loading }) => {
    const BECALLING_TEXT = type === NETCALL_TYPE.AUDIO ? VOICDE_TEXT : VIDEO_TEXT;
    const message = becalling ? BECALLING_TEXT : WAITING_TEXT;

    const getCls = (...args: any[]) =>
      classnames(s[type], { [s.hidden]: !loading && type === NETCALL_TYPE.VIDEO }, ...args);

    const nameCls = getCls(s.name);
    const avatarCLs = getCls(s.avatar);
    const messageCls = getCls(s.message);

    return (
      <>
        <CoverView className={nameCls}>{name}</CoverView>
        {loading && <CoverView className={messageCls}>{message}</CoverView>}
        <CoverView className={avatarCLs}>
          <CoverImage src={avatar} />
        </CoverView>
      </>
    );
  },
);

export default UserInfo;
