import useSetState from '@/hooks/useSetState';
import * as React from 'react';
import { Camera, CoverImage, CoverView, Map, View } from 'remax/wechat';
import Control from './components/control';
import { CALL_TYPE } from './components/types.d';
import UserInfo from './components/userinfo';
import classnames from 'classnames';

import s from './index.less';

const WAITING_TEXT = '正在等待对方接受邀请...';
const VOICDE_TEXT = '邀请你语音通话';
const VIDEO_TEXT = '邀请你视频通话';

interface State {
  type: CALL_TYPE;
  becalling: boolean;
  loading: boolean;
}

export default () => {
  const userinfo = {
    name: '医生：asddqwd',
    avatar: 'https://m.ijia120.com/miniprograms/avatar-default.png',
  };
  const [state, setState] = useSetState<State>({
    type: CALL_TYPE.VIDEO,
    becalling: true,
    loading: true,
  });

  const BECALLING_TEXT = state.type === CALL_TYPE.VOICE ? VOICDE_TEXT : VIDEO_TEXT;
  const message = state.becalling ? BECALLING_TEXT : WAITING_TEXT;

  const onSwitchType = React.useCallback(() => {
    setState({
      type: state.type === CALL_TYPE.VIDEO ? CALL_TYPE.VOICE : CALL_TYPE.VIDEO,
    });
  }, [state.type]);

  // 挂断
  const hangup = React.useCallback(() => {}, []);

  return (
    <View className={s.wrapper}>
      <Map latitude={23.099994} longitude={113.32452} style={{ width: '100%', height: '100%' }}>
        <CoverView
          className={classnames(s.userinfo, s[state.type], {
            [s.hidden]: !state.loading && state.type === CALL_TYPE.VIDEO,
          })}
        >
          <CoverView className={s.name}>{userinfo.name}</CoverView>
          {/* <CoverView className={s.avatar}>
            <CoverImage src={userinfo.avatar} />
          </CoverView> */}
        </CoverView>
        <Control type={state.type} />
        <CoverView>1qwdqwdfqwfqwfwqfq</CoverView>
      </Map>
    </View>
  );
};
