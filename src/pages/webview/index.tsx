import * as React from 'react';
import { useQuery } from 'remax';
import { setNavigationBarTitle, WebView } from 'remax/wechat';

export default () => {
  const { title, url } = useQuery<{ url: string; title?: string }>();

  React.useEffect(() => {
    title && setNavigationBarTitle({ title });
  }, [title]);

  return <WebView src={decodeURIComponent(url)} />;
};
