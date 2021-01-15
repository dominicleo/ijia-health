import { NetcallInstance } from './im/library/netcall';
import { NimInstance } from './im/library/nim';
import { EventEmitter } from 'events';

interface GlobalData {
  nim?: NimInstance;
  netcall?: NetcallInstance;
  event: EventEmitter;
  /** 文章临时文件路径 */
  ArticleTempFilePaths: Record<string, string>;
}

const GlobalData: GlobalData = {
  event: new EventEmitter(),
  ArticleTempFilePaths: {},
};

export default GlobalData;
