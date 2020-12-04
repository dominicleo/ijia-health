module.exports = {
  '*.{ts,tsx}': ['yarn fix-js', 'git add'],
  '*.{css,less}': ['yarn fix-css', 'git add'],
};
