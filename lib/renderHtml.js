const fs = require('node:fs/promises');
const path = require('node:path');
const handlebars = require('handlebars');

const renderCss = require('./renderCss');

handlebars.registerHelper('removePeriods', selector => selector.replace(/\./, ''));

async function renderHtml(options) {
  const source = await fs.readFile(options.htmlTemplate, 'utf8');
  const template = handlebars.compile(source);

  const htmlFontsPath = path.relative(options.htmlDest, options.dest);
  // Styles embedded in the html file should use default CSS template and
  // have path to fonts that is relative to html file location.
  const styles = await renderCss({ ...options, cssFontPath: htmlFontsPath });

  return template({
    names: options.names,
    fontName: options.fontName,
    styles,
    ...options.templateOptions
  });
}

module.exports = renderHtml;
