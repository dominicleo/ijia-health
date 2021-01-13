import Toast from '@/components/toast';
import { ArticleId } from '@/services/article/index.types';
import GlobalData from '@/utils/globalData';
import * as React from 'react';
import { downloadFile, openDocument, View } from 'remax/wechat';
import s from './index.less';

const ArticleFile: React.FC<{ id: ArticleId; file?: string }> = React.memo(({ id, file }) => {
  const onClick = async () => {
    console.log(id, file);
    if (!file) return;
    let filePath = GlobalData.ArticleTempFilePaths[id];
    try {
      if (!filePath) {
        Toast.loading({ message: '正在获取文档', duration: 0 });
        const { tempFilePath } = await downloadFile({ url: file });
        GlobalData.ArticleTempFilePaths[id] = filePath = tempFilePath;
      }
      await openDocument({ filePath });
      Toast.clear();
    } catch (error) {
      Toast('文档获取失败，请重试');
    }
  };

  React.useEffect(() => {
    return () => Toast.clear();
  }, []);

  return (
    <View className={s.file} onClick={onClick} hoverClassName='clickable' hoverStayTime={0}>
      点击查看文档
    </View>
  );
});

export default ArticleFile;
