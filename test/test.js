const { afterEach, describe, it } = require('node:test');

const fs = require('node:fs');
const path = require('node:path');
const _ = require('lodash');
const assert = require('node:assert');

const webfontsGenerator = require('..');

describe('webfont', async () => {
  const SRC = path.join(__dirname, 'src');
  const DEST = path.join(__dirname, 'dest');

  const FILES = _.map(fs.readdirSync(SRC), file => {
    return path.join(SRC, file);
  });

  const TYPES = ['ttf', 'woff', 'woff2', 'svg'];
  const FONT_NAME = 'fontName';

  const OPTIONS = {
    dest: DEST,
    files: FILES,
    fontName: FONT_NAME,
    types: TYPES
  };
  const { fileTypeFromFile } = await import('file-type');

  afterEach(async () => await fs.promises.rm(DEST, { recursive: true, force: true }));

  it('generates all fonts and css files', async () => {
    await webfontsGenerator(OPTIONS);

    const destFiles = fs.readdirSync(DEST);
    for (const type of TYPES) {
      const filename = `${FONT_NAME}.${type}`;
      const filepath = path.join(DEST, filename);
      assert(destFiles.includes(filename), `${type} file exists`);
      assert(fs.statSync(filepath).size > 0, `${type} file is not empty`);

      const DETECTABLE = ['ttf', 'woff', 'woff2'];
      if (_.includes(DETECTABLE, type)) {
        const filetype = await fileTypeFromFile(filepath);
        assert.equal(type, filetype?.ext, 'ttf filetype is correct');
      }
    }

    const cssFile = path.join(DEST, `${FONT_NAME}.css`);
    assert(fs.existsSync(cssFile), 'CSS file exists');
    assert(fs.statSync(cssFile).size > 0, 'CSS file is not empty');

    const htmlFile = path.join(DEST, `${FONT_NAME}.html`);
    assert(!fs.existsSync(htmlFile), 'HTML file does not exists by default');
  });

  it('returns object with fonts and function generateCss()', async () => {
    const result = await webfontsGenerator(OPTIONS);
    assert(result.svg);
    assert(result.ttf);

    assert.equal(typeof result.generateCss, 'function');
    const css = await result.generateCss();
    assert.equal(typeof css, 'string');
  });

  it('function generateCss can change urls', async () => {
    const urls = { svg: 'AAA', ttf: 'BBB', woff: 'CCC' };
    const result = await webfontsGenerator(OPTIONS);
    const css = await result.generateCss(urls);
    assert(css.includes('AAA'));
  });

  it('gives error when "dest" is undefined', async () => {
    const options = _.extend({}, OPTIONS, { dest: undefined });
    await assert.rejects(webfontsGenerator(options));
  });

  it('gives error when "files" is undefined', async () => {
    const options = _.extend({}, OPTIONS, { files: undefined });
    await assert.rejects(webfontsGenerator(options));
  });

  it('uses codepoints and startCodepoint', async () => {
    const START_CODEPOINT = 0x40;
    const CODEPOINTS = {
      close: 0xff
    };
    const options = _.extend({}, OPTIONS, {
      codepoints: CODEPOINTS,
      startCodepoint: START_CODEPOINT
    });
    await webfontsGenerator(options);

    const svg = await fs.promises.readFile(path.join(DEST, `${FONT_NAME}.svg`), 'utf8');

    function codepointInSvg(cp) {
      return svg.includes(cp.toString(16).toUpperCase());
    }

    assert(codepointInSvg(START_CODEPOINT), 'startCodepoint used');
    assert(codepointInSvg(START_CODEPOINT + 1), 'startCodepoint incremented');
    assert(codepointInSvg(CODEPOINTS.close), 'codepoints used');
  });

  it('generates html file when options.html is true', async () => {
    const options = _.extend({}, OPTIONS, { html: true });
    await webfontsGenerator(options);

    const htmlFile = path.join(DEST, `${FONT_NAME}.html`);
    assert(fs.existsSync(htmlFile), 'HTML file exists');
    assert(fs.statSync(htmlFile).size > 0, 'HTML file is not empty');
  });
});
