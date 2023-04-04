const fs = require('node:fs/promises');
const crypto = require('crypto');
const _ = require('lodash');
const handlebars = require('handlebars');

/** Calculates hash based on options and source SVG files */
async function calcHash(options) {
  const hash = crypto.createHash('md5');
  const texts = await Promise.all(
    options.files.map(async file => await fs.readFile(file, 'utf8'))
  );
  texts.forEach(t => hash.update(t));
  hash.update(JSON.stringify(options));
  return hash.digest('hex');
}

async function makeUrls(options) {
  const hash = await calcHash(options);
  const baseUrl = options.cssFontsUrl?.replace(/\\/g, '/');
  const urls = _.map(options.types, type => {
    const fontName = `${options.fontName}.${type}?${hash}`;
    return baseUrl ? new URL(fontName, baseUrl).href : fontName;
  });
  return _.zipObject(options.types, urls);
}

function makeSrc({ order, types, fontName }, urls) {
  const templates = {
    woff2: _.template('url("<%= url %>") format("woff2")'),
    woff: _.template('url("<%= url %>") format("woff")'),
    ttf: _.template('url("<%= url %>") format("truetype")'),
    svg: _.template('url("<%= url %>#<%= fontName %>") format("svg")'),
  };

  // Order used types according to 'options.order'.
  const orderedTypes = _.filter(order, type => types.includes(type));

  const src = _.map(orderedTypes, type =>
    templates[type]({
      url: urls[type],
      fontName,
    })
  ).join(',\n');

  return src;
}

function makeCtx(options, urls) {
  // Transform codepoints to hex strings
  const codepoints = _.fromPairs(
    _.map(options.codepoints, (codepoint, name) => [
      name,
      codepoint.toString(16),
    ])
  );

  return {
    fontName: options.fontName,
    src: makeSrc(options, urls),
    codepoints,
    ...options.templateOptions,
  };
}

async function renderCss(options, urls = makeUrls(options)) {
  const ctx = makeCtx(options, await urls);
  const source = await fs.readFile(options.cssTemplate, 'utf8');
  const template = handlebars.compile(source);
  return template(ctx);
}

module.exports = renderCss;
