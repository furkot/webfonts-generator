const fs = require('fs');
const path = require('path');

const webfontsGenerator = require('..');

const SRC = path.join(__dirname, 'src');
const FILES = fs.readdirSync(SRC).map(file => path.join(SRC, file));
const OPTIONS = {
  dest: path.join(__dirname, '..', 'temp'),
  files: FILES,
  fontName: 'fontName',
  types: ['svg', 'ttf', 'woff', 'woff2'],
  html: true,
};

webfontsGenerator(OPTIONS, error => {
  if (error) console.log('Fail!', error);
  else console.log('Done!');
});
