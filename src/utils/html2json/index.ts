import HTMLParser from './htmlparser';

const removeDOCTYPE = (html: string) =>
  html
    .replace(/<\?xml.*\?>\n/, '')
    .replace(/<!doctype.*\>\n/, '')
    .replace(/<!DOCTYPE.*\>\n/, '');

interface Node {
  name: string;
  attrs?: { [name: string]: string };
  type?: 'node' | 'text';
  text?: string;
  children?: Node[];
}

const html2json = (html: string) => {
  html = removeDOCTYPE(html);
  const buffer: Node[] = [];
  const result: Node = {
    name: 'div',
    children: [],
  };

  HTMLParser(html, {
    start: (tag, attrs, unary) => {
      const node = {
        name: tag,
        attrs: {},
      };

      if (attrs.length) {
        node.attrs = attrs.reduce(
          (previous: { [key: string]: any }, attr) => {
            const { name } = attr;
            let { value } = attr;

            value.match(/ /) && (value = value.split(' '));
            Array.isArray(value) && (value = value.reduce((total, item) => total + item));

            if (previous[name]) {
              previous[name] = previous[name] + value;
            } else {
              previous[name] = value;
            }

            return previous;
          },
          { class: `node-${tag}` },
        );
      }

      if (unary) {
        const parent = buffer[0] || result;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        buffer.unshift(node);
      }
    },
    end: (tag) => {
      const node = buffer.shift();

      if (!node) return;
      if (node.name !== tag) {
        throw new Error('html2json: mismatch end tag');
      }

      if (buffer.length === 0) {
        result.children?.push(node);
      } else {
        const parent = buffer[0];
        if (parent.children === undefined) {
          parent.children = [];
        }
        parent.children.push(node);
      }
    },
    chars: (text) => {
      const node = {
        type: 'text',
        text,
      };

      if (buffer.length === 0) {
        result.children?.push(node);
      } else {
        const parent = buffer[0];
        if (parent.children === undefined) {
          parent.children = [];
        }
        parent.children.push(node);
      }
    },
  });

  return result.children;
};

export default html2json;
