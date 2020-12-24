import { NetcallInstance } from './im/library/netcall';
import { NimInstance } from './im/library/nim';

interface GlobalData {
  nim?: NimInstance;
  netcall?: NetcallInstance;
}

const GlobalData: GlobalData = {};

export default GlobalData;
