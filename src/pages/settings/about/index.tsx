import classnames from 'classnames';
import * as React from 'react';
import { getAccountInfoSync, getUpdateManager, setClipboardData, Text, View } from 'remax/wechat';

import { APP_NAME } from '@/constants/common';
import PAGE from '@/constants/page';
import { FRONTEND_URL } from '@/utils/baseURL';
import history from '@/utils/history';
import { checkUpdate, requestUpdate } from '@/utils/update';

import s from './index.less';

const VERSION_TEXT = {
  develop: '开发版',
  trial: '体验版',
  release: '正式版',
};

const WECHAT_OFFICIAL_ACCOUNTE_NAME = '爱加健康平台';

export default () => {
  const { miniProgram } = getAccountInfoSync();
  const [update, setUpdate] = React.useState(false);

  React.useEffect(() => {
    checkUpdate().then(setUpdate);
  }, []);

  const onClickUpdate = () => {
    if (!update) return;
    requestUpdate();
  };

  return (
    <View className={s.wrapper}>
      <View className={s.logo} />
      <View className={s.name}>{APP_NAME}</View>
      <View className={s.version}>
        当前版本号：
        <Text>{miniProgram.version ? `v${miniProgram.version}` : 'v0.0.0'}</Text>
        <Text>{VERSION_TEXT[miniProgram.envVersion]}</Text>
      </View>
      <View className={s.content}>
        <View className={classnames(s.list, s.officialAccount)}>
          <View
            className={s.item}
            onClick={() => setClipboardData({ data: WECHAT_OFFICIAL_ACCOUNTE_NAME })}
            hoverClassName='clickable'
            hoverStayTime={0}
          >
            <View>
              微信公众号<Text>{WECHAT_OFFICIAL_ACCOUNTE_NAME}</Text>
            </View>
            <View className={s.copy}>复制</View>
          </View>
        </View>

        <View className={s.list}>
          <View
            className={classnames(s.item, { [s.arrow]: update })}
            onClick={onClickUpdate}
            hoverClassName={update ? 'clickable' : 'none'}
            hoverStayTime={0}
          >
            版本更新
            <View className={classnames(s.extra, { [s.active]: update })}>
              {update ? '发现新版本' : '已是最新版本'}
            </View>
          </View>
          <View
            className={classnames(s.item, s.arrow)}
            onClick={() =>
              history.push(PAGE.WEBVIEW, { url: `${FRONTEND_URL}/#/Personal/protocolRule` })
            }
            hoverClassName='clickable'
            hoverStayTime={0}
          >
            政策法规
          </View>
          <View
            className={classnames(s.item, s.arrow)}
            onClick={() =>
              history.push(PAGE.WEBVIEW, { url: `${FRONTEND_URL}/#/Personal/protocolFile` })
            }
            hoverClassName='clickable'
            hoverStayTime={0}
          >
            服务协议
          </View>
        </View>
      </View>
    </View>
  );
};
