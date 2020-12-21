declare module '*.svg';
declare module '*.png';
declare module '*.css';
declare module '*.less';

declare const wx: any;
declare const __wxConfig: any;
declare const getCurrentPages: any;

// declare module '@vant/weapp/lib/*';

declare module 'axios/lib/*';
declare module 'axios/dist/axios' {
  import axios from 'axios';

  export default axios;
}
