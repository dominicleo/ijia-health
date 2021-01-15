// @ts-nocheck

//浮点数转换为整数
function toInt(num) {
  var rel = {};
  var str, pos, len, times;
  str = num < 0 ? -num + '' : num + '';
  pos = str.indexOf('.');
  len = str.substr(pos + 1).length;
  times = Math.pow(10, len + 1);
  rel.times = times;
  rel.num = num;
  return rel;
}

//计算过程
export function operate(a, b, op) {
  var d1 = toInt(a);
  var d2 = toInt(b);
  var max = d1.times > d2.times ? d1.times : d2.times;
  var rel;
  switch (op) {
    case '+':
      rel = (d1.num * max + d2.num * max) / max;
      break;
    case '-':
      rel = (d1.num * max - d2.num * max) / max;
      break;
    case '*':
      rel = (d1.num * max * (d2.num * max)) / (max * max);
      break;
    case '/':
      rel = (d1.num * max) / (d2.num * max);
      break;
  }
  return rel;
}
