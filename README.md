[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

This is a clone of [sunflowerdeath/webfonts-generator] project.

# webfonts-generator

Generator of webfonts from SVG icons.

Features:

* Supported font formats: WOFF2, WOFF, TTF and SVG.
* Generates CSS files and HTML preview, allows to use custom templates.

## Install

```
npm install --save-dev webfonts-generator
# or
yarn add --dev webfonts-generator
```

## Usage

```js
const webfontsGenerator = require('webfonts-generator');

await webfontsGenerator({
  files: [
    'src/dropdown.svg',
    'src/close.svg',
  ],
  dest: 'dest/',
})
```

## webfontsGenerator(options)

### options

Type: `object`

Object with options. See the list of options.

## List of options

### files

*required*

Type: `array.<string>`

List of SVG files.

### dest

*required*

Type: `string`

Directory for generated font files.

### fontName

Type: `string`
<br>
Default: `'iconfont'`

Name of font and base name of font files.

### css

Type: `boolean`
<br>
Default: `true`

Whether to generate CSS file.

### cssDest

Type: `string`
<br>
Default: `path.join(options.dest, options.fontName + '.css')`

Path for generated CSS file.

### cssTemplate

Type: `string`
<br>
Default: path of default CSS template

Path of custom CSS template.
Generator uses handlebars templates.

Template receives options from `options.templateOptions` along with the following options:

* fontName
* src `string` &ndash; Value of the `src` property for `@font-face`.
* codepoints `object` &ndash; Codepoints of icons in hex format.

Paths of default templates are stored in the `webfontsGenerator.templates` object.

* `webfontsGenerator.templates.css` &ndash; Default CSS template path.
	<br>
	It generates classes with names based on values from `options.templateOptions`.

* `webfontsGenerator.templates.scss` &ndash; Default SCSS template path.
	<br>
	It generates mixin `webfont-icon` to add icon styles.
	<br>
	It is safe to use multiple generated files with mixins together.
	<br>
	Example of use:

	```
	@import 'iconfont';
	.icon { @include webfont-icon('icon'); }
	```

### cssFontsPath

Type: `string`
<br>
Default: `options.destCss`

Fonts path used in CSS file.

### html

Type: `boolean`
<br>
Default: `false`

Whether to generate HTML preview.

### htmlDest

Type: `string`
<br>
Default: `path.join(options.dest, options.fontName + '.html')`

Path for generated HTML file.

### htmlTemplate

Type: `string`
<br>
Default: `templates/html.hbs`

HTML template path.
Generator uses handlebars templates.

Template receives options from `options.templateOptions` along with the following options:

* fontName
* styles `string` &ndash; Styles generated with default CSS template.
	(`cssFontsPath` is chaged to relative path from `htmlDest` to `dest`)
* names `array.<string>` &ndash; Names of icons.

### templateOptions

Type: `object`

Additional options for CSS & HTML templates, that extends default options.

Default options are:
```js
{
	classPrefix: 'icon-',
	baseSelector: '.icon'
}
```

### types

Type: `array<string>`
<br>
Default: `['woff2', 'woff's]`

Font file types to generate.
Possible values: `svg, ttf, woff, woff2`.

### order

Type: `array<string>`
<br>
Default: `['woff2', 'woff', 'ttf', 'svg']`

Order of `src` values in `font-face` in CSS file.

### rename

Type: `function(string) -> string`
<br>
Default: basename of file

Function that takes path of file and return name of icon.

### startCodepoint

Type: `number`
<br>
Default: `0xF101`

Starting codepoint. Defaults to beginning of unicode private area.

### codepoints

Type: `object`

Specific codepoints for certain icons.
Icons without codepoints will have codepoints incremented from `startCodepoint` skipping duplicates.

### fontName, normalize, fontHeight, round, descent

Options that are passed directly to
[svgicons2svgfont](https://github.com/nfroidure/svgicons2svgfont).

### formatOptions

Type: `object`

Specific per format arbitrary options to pass to the generator

format and matching generator:
- `svg` - [svgicons2svgfont](https://github.com/nfroidure/svgicons2svgfont).
- `ttf` - [svg2ttf](https://github.com/fontello/svg2ttf).
- `woff2` - [ttf2woff2](https://github.com/nfroidure/ttf2woff2).
- `woff` - [ttf2woff](https://github.com/fontello/ttf2woff).

```js
const result = await webfontsGenerator({
  // options
  formatOptions: {
  	// options to pass specifically to the ttf generator
  	ttf: {
  		ts: 1451512800000
  	}
  }
})
```

### writeFiles

Type: `boolean`
<br>
Default: `true`

It is possible to not create files and get generated fonts in object
 to write them to files later.
<br>
Also results object will have function `generateCss([urls])`
where `urls` is an object with future fonts urls.

```js
const result = await webfontsGenerator({
  // options
  writeFiles: false
});
// result.woff, result.ttf, etc - generated fonts
// result.generateCss(urls) - function to generate css
```

## License

Public domain, see the `LICENCE` file.

[sunflowerdeath/webfonts-generator]: https://github.com/sunflowerdeath/webfonts-generator

[npm-image]: https://img.shields.io/npm/v/@furkot/webfonts-generator
[npm-url]: https://npmjs.org/package/@furkot/webfonts-generator

[build-url]: https://github.com/furkot/webfonts-generator/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/actions/workflow/status/furkot/webfonts-generator/check.yaml?branch=main

[deps-image]: https://img.shields.io/librariesio/release/npm/@furkot/webfonts-generator
[deps-url]: https://libraries.io/npm/@furkot%2Fwebfonts-generator
