const fs = require('fs');
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

function webfont(options, done) {
  if (options.cssFontsPath) {
    console.log(
      'Option "cssFontsPath" is deprecated. Use "cssFontsUrl" instead.'
    );
    options.cssFontsUrl = options.cssFontsPath;
  }

  options = _.extend({}, DEFAULT_OPTIONS, options);

  if (options.dest === undefined)
    return done(new Error('"options.dest" is undefined.'));
  if (options.files === undefined)
    return done(new Error('"options.files" is undefined.'));
  if (!options.files.length)
    return done(new Error('"options.files" is empty.'));

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

  // TODO output
  generateFonts(options)
    .then(result => {
      if (options.writeFiles) writeResult(result, options);

      result.generateCss = urls => renderCss(options, urls);
      done(null, result);
    })
    .catch(done);
}

function writeFile(content, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, content);
}

function writeResult(fonts, options) {
  _.each(fonts, (content, type) => {
    const filepath = path.join(options.dest, `${options.fontName}.${type}`);
    writeFile(content, filepath);
  });
  if (options.css) {
    const css = renderCss(options);
    writeFile(css, options.cssDest);
  }
  if (options.html) {
    const html = renderHtml(options);
    writeFile(html, options.htmlDest);
  }
}

webfont.templates = TEMPLATES;

module.exports = webfont;
