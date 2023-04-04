const fs = require('node:fs/promises');
const path = require('path');
const _ = require('lodash');

const generateFonts = require('./lib/generateFonts');
const renderCss = require('./lib/renderCss');
const renderHtml = require('./lib/renderHtml');

const TEMPLATES_DIR = path.join(__dirname, 'templates');
const TEMPLATES = {
  css: path.join(TEMPLATES_DIR, 'css.hbs'),
  scss: path.join(TEMPLATES_DIR, 'scss.hbs'),
  html: path.join(TEMPLATES_DIR, 'html.hbs'),
};

const DEFAULT_TEMPLATE_OPTIONS = {
  baseSelector: '.icon',
  classPrefix: 'icon-',
};

const DEFAULT_OPTIONS = {
  writeFiles: true,
  fontName: 'iconfont',
  css: true,
  cssTemplate: TEMPLATES.css,
  html: false,
  htmlTemplate: TEMPLATES.html,
  types: ['woff', 'woff2'],
  order: ['woff2', 'woff', 'ttf', 'svg'],
  rename(file) {
    return path.basename(file, path.extname(file));
  },
  formatOptions: {},
  /**
   * Unicode Private Use Area start.
   * http://en.wikipedia.org/wiki/Private_Use_(Unicode)
   */
  startCodepoint: 0xf101,
  normalize: true,
};

async function webfont(options) {
  if (options.cssFontsPath) {
    console.log(
      'Option "cssFontsPath" is deprecated. Use "cssFontsUrl" instead.'
    );
    options.cssFontsUrl = options.cssFontsPath;
  }

  options = _.extend({}, DEFAULT_OPTIONS, options);

  if (options.dest === undefined)
    throw new Error('"options.dest" is undefined.');
  if (options.files === undefined)
    throw new Error('"options.files" is undefined.');
  if (!options.files.length)
    throw new Error('"options.files" is empty.');

  // We modify codepoints later, so we can't use same object from default options.
  if (options.codepoints === undefined) options.codepoints = {};

  options.names = _.map(options.files, options.rename);
  if (options.cssDest === undefined) {
    options.cssDest = path.join(options.dest, `${options.fontName}.css`);
  }
  if (options.htmlDest === undefined) {
    options.htmlDest = path.join(options.dest, `${options.fontName}.html`);
  }

  options.templateOptions = _.extend(
    {},
    DEFAULT_TEMPLATE_OPTIONS,
    options.templateOptions
  );

  // Generates codepoints starting from `options.startCodepoint`,
  // skipping codepoints explicitly specified in `options.codepoints`
  let currentCodepoint = options.startCodepoint;
  const codepointsValues = _.values(options.codepoints);
  function getNextCodepoint() {
    while (_.includes(codepointsValues, currentCodepoint)) {
      currentCodepoint++;
    }
    const res = currentCodepoint;
    currentCodepoint++;
    return res;
  }
  _.each(options.names, name => {
    if (!options.codepoints[name]) {
      options.codepoints[name] = getNextCodepoint();
    }
  });

  const result = await generateFonts(options);
  if (options.writeFiles) {
    await writeResult(result, options);
  }
  result.generateCss = urls => renderCss(options, urls);
  return result;
}

async function writeFile(content, dest) {
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, content);
}

async function writeResult(fonts, options) {
  const writes = _.map(fonts, (content, type) => {
    const filepath = path.join(options.dest, `${options.fontName}.${type}`);
    return writeFile(content, filepath);
  });
  if (options.css) {
    writes.push(writeCss());
  }
  if (options.html) {
    writes.push(writeHtml());
  }
  return Promise.all(writes);

  async function writeCss() {
    const css = await renderCss(options);
    return writeFile(css, options.cssDest);
  }

  async function writeHtml() {
    const html = await renderHtml(options);
    return writeFile(html, options.htmlDest);
  }
}

webfont.templates = TEMPLATES;

module.exports = webfont;
