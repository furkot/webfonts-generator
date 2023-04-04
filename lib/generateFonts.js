const fs = require('node:fs');
const _ = require('lodash');

const svgicons2svgfont = require('svgicons2svgfont');
const svg2ttf = require('svg2ttf');
const ttf2woff = require('ttf2woff');
const ttf2woff2 = require('wawoff2');

/**
 * Generators for files of different font types.
 *
 * Generators have following properties:
 * dep <string> names of font type that will be generated before current
 *		and passed to generator function.
 * fn {function(options, depFonts)} Generator function with following arguments:
 *	 options {object} Options passed to 'generateFonts' function.
 *	 depFont Font listed in dep.
 */
const generators = {
  svg: {
    fn(options) {
      const svgOptions = {
        ..._.pick(
          options,
          'fontName',
          'fontHeight',
          'descent',
          'normalize',
          'round'
        ),
        ...options.formatOptions['svg'],
        log: () => {},
      };

      return new Promise(resolve => {
        let font = Buffer.allocUnsafe(0);
        const fontStream = new svgicons2svgfont(svgOptions)
          .on('data', data => (font = Buffer.concat([font, data])))
          .on('end', () => resolve(font.toString()));

        _.each(options.files, onGlyph);

        fontStream.end();

        function onGlyph(file, idx) {
          const glyph = fs.createReadStream(file);
          const name = options.names[idx];
          const unicode = String.fromCharCode(options.codepoints[name]);
          let ligature = '';
          for (let i = 0; i < name.length; i++) {
            ligature += String.fromCharCode(name.charCodeAt(i));
          }
          glyph.metadata = {
            name,
            unicode: [unicode, ligature],
          };
          fontStream.write(glyph);
        }
      });
    },
  },

  ttf: {
    dep: 'svg',
    fn({ formatOptions }, svgFont) {
      const font = svg2ttf(svgFont, formatOptions['ttf']);
      return Buffer.from(font.buffer);
    },
  },

  woff: {
    dep: 'ttf',
    fn({ formatOptions }, ttfFont) {
      const font = ttf2woff(new Uint8Array(ttfFont), formatOptions['woff']);
      return Buffer.from(font.buffer);
    },
  },

  woff2: {
    dep: 'ttf',
    fn(options, ttfFont) {
      return ttf2woff2.compress (ttfFont);
    },
  },
};

async function generateFonts(options) {
  const type2font = {};

  async function makeFont(type) {
    if (type2font[type]) return type2font[type];

    const { dep, fn } = generators[type];

    if (!dep) {
      return fn(options);
    }

    type2font[dep] = makeFont(dep);
    const font = await type2font[dep];
    return fn(options, font);
  }

  const results = await Promise.all(_.map(options.types, makeFont));
  return _.zipObject(options.types, results);
}

module.exports = generateFonts;
