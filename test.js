const fs = require('fs');
const path = require('path');
const glob = require('glob');

const ROOT = path.resolve(process.cwd(), 'src/pages/prescription');

async function run() {
  const files = await new Promise((resolve, reject) =>
    glob('**/*.less', { cwd: ROOT }, (error, data) => (error ? reject(error) : resolve(data))),
  );

  files.forEach((file) => {
    const filepath = path.resolve(ROOT, file);
    const temp = fs.readFileSync(filepath, 'utf-8');
    const content = temp.replace(/\d+px/gi, (value) => {
      const number = value.replace(/px$/, '') - 0;
      if (number > 1) return number / 2 + 'px';
      return value;
    });
    fs.writeFileSync(filepath, content);
  });
}

run();
