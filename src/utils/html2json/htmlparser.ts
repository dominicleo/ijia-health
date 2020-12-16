// const START_TAG_REG = /^<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
// const END_TAG_REG = /^<\/([-A-Za-z0-9_]+)[^>]*>/;
// const ATTR_REG = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

// const makeMap = (value: string) => {
//   const map = new Map<string, boolean>();

//   value.split(',').forEach((tag) => {
//     map.set(tag, true);
//   });

//   return map;
// };

// const EMPTY_MAP = makeMap(
//   'area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr',
// );

// const BLOCK_MAP = makeMap(
//   'a,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video',
// );

// const INLINE_MAP = makeMap(
//   'abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var',
// );

// const CLOSESELF_MAP = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr');

// const FILLATTRS_MAP = makeMap(
//   'checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected',
// );

// const SPECIAL_MAP = makeMap('script,style');

// type Attr = {
//   name: string;
//   value: any;
//   escaped: string;
// };

// interface Handler {
//   start?: (tag: string, attrs: Attr[], unary: boolean) => void;
//   end?: (tag: string) => void;
//   chars?: (text: string) => void;
//   comment?: (text: string) => void;
// }

// function HTMLParser(html: string, handler?: Handler): void {
//   const stack: string[] = [];
//   let index: number;
//   let chars: boolean;
//   let match: RegExpMatchArray | null;
//   let last = html;

//   const getLastStack = () => stack[stack.length - 1];

//   const parseStartTag = (tag: string, tagName: string, rest: string, unary: boolean) => {
//     tagName = tagName.toLowerCase();
//     if (BLOCK_MAP.get(tagName)) {
//       while (getLastStack() && INLINE_MAP.get(getLastStack())) {
//         parseEndTag('', getLastStack());
//       }
//     }

//     if (CLOSESELF_MAP.get(tagName) && getLastStack() === tagName) {
//       parseEndTag('', tagName);
//     }

//     unary = EMPTY_MAP.get(tagName) || !!unary;

//     !unary && stack.push(tagName);

//     if (handler?.start) {
//       const attrs: Attr[] = [];

//       rest.replace(ATTR_REG, (_, name, ...args) => {
//         const value = args[0]
//           ? args[0]
//           : args[1]
//           ? args[1]
//           : args[2]
//           ? args[2]
//           : FILLATTRS_MAP.get(name)
//           ? name
//           : '';

//         attrs.push({
//           name,
//           value,
//           escaped: value.replace(/(^|[^\\])"/g, '$1\\"'),
//         });

//         return '';
//       });

//       handler.start(tagName, attrs, unary);
//     }

//     return '';
//   };

//   const parseEndTag = (_?: string, tagName?: string) => {
//     let position: number;
//     if (!tagName) {
//       position = 0;
//     } else {
//       for (position = stack.length - 1; position >= 0; position--) {
//         if (stack[position] === tagName) break;
//       }
//     }

//     if (position >= 0) {
//       for (let i = stack.length - 1; i >= 0; i--) {
//         handler?.end && handler.end(stack[i]);
//       }
//       stack.length = position;
//     }
//     return '';
//   };

//   while (html) {
//     chars = true;
//     if (!getLastStack() || !SPECIAL_MAP.get(getLastStack())) {
//       // comment
//       if (html.indexOf('<!--') === 0) {
//         index = html.indexOf('-->');
//         if (index >= 0) {
//           handler?.comment && handler.comment(html.substring(4, index));
//           html = html.substring(index + 3);
//           chars = false;
//         }
//         // end tag
//       } else if (html.indexOf('</') === 0) {
//         match = html.match(END_TAG_REG);
//         if (match) {
//           html = html.substring(match[0].length);
//           match[0].replace(END_TAG_REG, parseEndTag);
//           chars = false;
//         }
//         // start tag
//       } else if (html.indexOf('<') == 0) {
//         match = html.match(START_TAG_REG);

//         if (match) {
//           html = html.substring(match[0].length);
//           match[0].replace(START_TAG_REG, parseStartTag);
//           chars = false;
//         }
//       }

//       if (chars) {
//         index = html.indexOf('<');

//         const text = index < 0 ? html : html.substring(0, index);
//         html = index < 0 ? '' : html.substring(index);

//         handler?.chars && handler.chars(text);
//       }
//     } else {
//       html = html.replace(new RegExp('([\\s\\S]*?)</' + getLastStack() + '[^>]*>'), (_, text) => {
//         text = text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, '$1$2');
//         handler?.chars && handler.chars(text);

//         return '';
//       });

//       parseEndTag('', getLastStack());
//     }

//     if (html == last) throw new Error(`Parse Error: ${html}`);
//     last = html;
//   }

//   // Clean up any remaining tags
//   parseEndTag();
// }

// export default HTMLParser;

/* eslint-disable */
// @ts-nocheck
// Regular Expressions for parsing tags and attributes
var startTag = /^<([-A-Za-z0-9_]+)((?:\s+[a-zA-Z_:][-a-zA-Z0-9_:.]*(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
  endTag = /^<\/([-A-Za-z0-9_]+)[^>]*>/,
  attr = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

// Empty Elements - HTML 5
var empty = makeMap(
  'area,base,basefont,br,col,frame,hr,img,input,link,meta,param,embed,command,keygen,source,track,wbr',
);

// Block Elements - HTML 5
var block = makeMap(
  'a,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video',
);

// Inline Elements - HTML 5
var inline = makeMap(
  'abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var',
);

// Elements that you can, intentionally, leave open
// (and which close themselves)
var closeSelf = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr');

// Attributes that have their values filled in disabled="disabled"
var fillAttrs = makeMap(
  'checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected',
);

// Special Elements (can contain anything)
var special = makeMap('script,style');

var HTMLParser = function (html, handler) {
  var index,
    chars,
    match,
    stack = [],
    last = html;
  stack.last = function () {
    return this[this.length - 1];
  };

  while (html) {
    chars = true;

    // Make sure we're not in a script or style element
    if (!stack.last() || !special[stack.last()]) {
      // Comment
      if (html.indexOf('<!--') == 0) {
        index = html.indexOf('-->');

        if (index >= 0) {
          if (handler.comment) handler.comment(html.substring(4, index));
          html = html.substring(index + 3);
          chars = false;
        }

        // end tag
      } else if (html.indexOf('</') == 0) {
        match = html.match(endTag);

        if (match) {
          html = html.substring(match[0].length);
          match[0].replace(endTag, parseEndTag);
          chars = false;
        }

        // start tag
      } else if (html.indexOf('<') == 0) {
        match = html.match(startTag);

        if (match) {
          html = html.substring(match[0].length);
          match[0].replace(startTag, parseStartTag);
          chars = false;
        }
      }

      if (chars) {
        index = html.indexOf('<');

        var text = index < 0 ? html : html.substring(0, index);
        html = index < 0 ? '' : html.substring(index);

        if (handler.chars) handler.chars(text);
      }
    } else {
      html = html.replace(
        new RegExp('([\\s\\S]*?)</' + stack.last() + '[^>]*>'),
        function (all, text) {
          text = text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, '$1$2');
          if (handler.chars) handler.chars(text);

          return '';
        },
      );

      parseEndTag('', stack.last());
    }

    if (html == last) throw 'Parse Error: ' + html;
    last = html;
  }

  // Clean up any remaining tags
  parseEndTag();

  function parseStartTag(tag, tagName, rest, unary) {
    tagName = tagName.toLowerCase();

    if (block[tagName]) {
      while (stack.last() && inline[stack.last()]) {
        parseEndTag('', stack.last());
      }
    }

    if (closeSelf[tagName] && stack.last() == tagName) {
      parseEndTag('', tagName);
    }

    unary = empty[tagName] || !!unary;

    if (!unary) stack.push(tagName);

    if (handler.start) {
      var attrs = [];

      rest.replace(attr, function (match, name) {
        var value = arguments[2]
          ? arguments[2]
          : arguments[3]
          ? arguments[3]
          : arguments[4]
          ? arguments[4]
          : fillAttrs[name]
          ? name
          : '';

        attrs.push({
          name: name,
          value: value,
          escaped: value.replace(/(^|[^\\])"/g, '$1\\"'), //"
        });
      });

      if (handler.start) handler.start(tagName, attrs, unary);
    }
  }

  function parseEndTag(tag, tagName) {
    // If no tag name is provided, clean shop
    if (!tagName) var pos = 0;
    // Find the closest opened tag of the same type
    else for (var pos = stack.length - 1; pos >= 0; pos--) if (stack[pos] == tagName) break;

    if (pos >= 0) {
      // Close all the open elements, up the stack
      for (var i = stack.length - 1; i >= pos; i--) if (handler.end) handler.end(stack[i]);

      // Remove the open elements from the stack
      stack.length = pos;
    }
  }
};

function makeMap(str) {
  var obj = {},
    items = str.split(',');
  for (var i = 0; i < items.length; i++) obj[items[i]] = true;
  return obj;
}

export default HTMLParser;
