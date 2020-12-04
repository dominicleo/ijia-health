const less = require('@remax/plugin-less');

module.exports = {
  compressTemplate: true,
  pxToRpx: false,
  plugins: [less()],
};
