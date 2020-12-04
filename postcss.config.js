module.exports = ({ options }) => ({
  plugins: {
    ...options.plugins,
    "postcss-url": { url: "inline", maxSize: 100 },
    "postcss-import": {},
    "@remax/postcss-px2units": {
      multiple: 2,
    },
  },
});
