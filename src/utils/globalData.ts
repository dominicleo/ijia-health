import { NetcallInstance } from './im/library/netcall';
import { NimInstance } from './im/library/nim';
import { EventEmitter } from 'events';

interface GlobalData extends Record<string, any> {
  nim?: NimInstance;
  netcall?: NetcallInstance;
  event: EventEmitter;
  /** 文章临时文件路径 */
  ArticleTempFilePaths: Record<string, string>;
  isPushBeCallPage: boolean;
}

const GlobalData: GlobalData = {
  event: new EventEmitter(),
  ArticleTempFilePaths: {},
  isPushBeCallPage: false,
};

export default GlobalData;
