const baseURL = 'https://oss-img.ijia120.com/static/img';
const thumbURL = `${baseURL}/ajmd_s_pressed.png`;
const EMOJI_PREFIX = 'ajmd';
const EMOJI_SIZE = 33;
const EMOJI_EXTNAME = 'gif';

const EMOJI_MAP = new Map();

const EMOJI_ITEMS = Array.from(Array(EMOJI_SIZE).keys()).map((_, index) => {
  const name = [EMOJI_PREFIX, String(index + 1).padStart(3, '0')].join('');
  const filename = [name, EMOJI_EXTNAME].join('.');
  const url = [baseURL, EMOJI_PREFIX, filename].join('/');
  EMOJI_MAP.set(name, url);
  return { name, url, catalog: EMOJI_PREFIX };
});

const EMOJI_CONFIG = {
  name: EMOJI_PREFIX,
  icon: thumbURL,
  items: EMOJI_ITEMS,
  map: EMOJI_MAP,
};

export default EMOJI_CONFIG;
