import classnames from 'classnames';
import * as React from 'react';
import { CoverView, Camera, CoverImage } from 'remax/wechat';
import s from './index.module.less';

interface UserinfoPropsType {
  center?: boolean;
  name: string;
  avatar?: string;
  description?: string;
  showDescription?: boolean;
  overlay?: 'camera' | 'avatar';
}

export default React.memo((props: UserinfoPropsType) => {
  const { center, name, avatar, description, showDescription, overlay } = props;
  return (
    <CoverView className={s.wrapper}>
      {overlay === 'camera' && (
        <Camera className={s.camera} mode='normal' devicePosition='front'>
          <CoverView className={classnames(s.overlay, s.overlayCamera)} />
        </Camera>
      )}
      {/* {overlay === 'avatar' && (
        <CoverImage
          src={avatar}
          className={classnames(s.overlay, s.overlayAvatar)}
        />
      )} */}

      <CoverView
        className={classnames(s.userinfo, {
          [s.center]: center,
        })}
      >
        <CoverView className={s.details}>
          <CoverView className={s.username}>{name}</CoverView>
          {showDescription && <CoverView className={s.description}>{description}</CoverView>}
        </CoverView>
        <CoverImage src={avatar} className={s.avatar} />
      </CoverView>
    </CoverView>
  );
});
