import { NetcallInstance } from './im/library/netcall';
import { NimInstance } from './im/library/nim';

interface GlobalData {
  nim?: NimInstance;
  netcall?: NetcallInstance;
  /** 文章临时文件路径 */
  ArticleTempFilePaths: Record<string, string>;
}

const GlobalData: GlobalData = {
  ArticleTempFilePaths: {},
};

export default GlobalData;
