const path = require('path');
const less = require('@remax/plugin-less');

const NIM_PATH = path.resolve(__dirname, 'src/utils/im/library/nim.js');
const NIM_NETCALL_PATH = path.resolve(__dirname, 'src/utils/im/library/netcall.js');

module.exports = {
  compressTemplate: true,
  pxToRpx: false,
  plugins: [less()],
  configWebpack({ config }) {
    config.module.rule('js').exclude.add(NIM_PATH).add(NIM_NETCALL_PATH).end();
  },
};
