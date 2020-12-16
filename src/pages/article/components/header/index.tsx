import classnames from 'classnames';
import * as React from 'react';
import { usePageInstance } from 'remax';
import { createIntersectionObserver, nextTick, View } from 'remax/wechat';

import { Doctor } from '@/services/doctor/index.types';
import Navbar from '@vant/weapp/lib/nav-bar';

import ArticleDoctor from '../doctor';
import s from './index.less';
import history from '@/utils/history';

const ArticleHeader: React.FC<{
  doctor?: Doctor;
  containerSelector?: string;
  selector?: string;
}> = ({ doctor, containerSelector, selector }) => {
  const instance = usePageInstance();
  const [hidden, setHidden] = React.useState(false);
  const observer = React.useRef<WechatMiniprogram.IntersectionObserver>();

  const init = () => {
    if (observer.current || !containerSelector || !selector) return;
    observer.current = createIntersectionObserver(instance);
    observer.current.relativeTo(containerSelector).observe(selector, ({ intersectionRatio }) => {
      nextTick(() => setHidden(intersectionRatio === 0));
    });
  };

  React.useEffect(() => {
    if (!doctor) return;
    nextTick(init);
    return () => {
      observer.current && observer.current.disconnect();
    };
  }, [doctor]);

  return (
    <View className={s.navbar}>
      <Navbar border={false}>
        <View slot='left'>
          <View className={s.back} onClick={() => history.back()} />
        </View>
        <View slot='title' className={classnames(s.header, { [s.hidden]: hidden })}>
          <View className={s.title}>文章详情</View>
          {doctor && <ArticleDoctor data={doctor} />}
        </View>
      </Navbar>
    </View>
  );
};

export default ArticleHeader;
