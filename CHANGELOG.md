
2.0.1 / 2024-04-11
==================

 * Bugfix : missing 'await' in the rendering of the html template

2.0.0 / 2023-04-04
==================

 * swith to using promise based API

1.0.2 / 2023-03-28
==================

 * upgrade svgicons2svgfont to 12.0.0
 * use node test runner instead of mocha

1.0.1 / 2022-01-20
==================

 * remove url-join dependency
 * replace ttf2woff2 with wawoff2

1.0.0 / 2022-01-16
==================

 * rewrite in modern javascript
 * remove `baseClass` option warning
 * remove support for generating EOT

0.4.0

* Add woff2 support.
* Update dependencies.
* Deprecate baseClass in favor of a more powerful baseSelector.

0.3.4

* Fix support for URLs to fonts in style files (#10).
	Option 'cssFontsPath' is deprecated. New option is 'cssFontsUrl'.

0.3.3

* Update deps

0.3.2

* Add options 'formatOptions'.

0.3.0

* Add option 'writeFiles'.

0.2.4

* Add hashes to font urls.
* Fix backslashes in urls on Windows.

0.2.0

* Option `cssTemplatePath` replaced with object `webfontsGenerator.templates`
* Option `templateOptions` now extends defaults, not replaces.

0.1.2 &ndash; Added generating SCSS mixins:

* Added options `cssTemplatePath`
* Added SCSS template

0.1.1 &ndash; Fix bug with options.codepoints and multiple calls

0.1.0 &ndash; Added generating HTML previews:

* Renamed option `cssTemplateData` to `templateOptions`.
* Renamed option `destCss` to `cssDest`.
* Added options `css`, `html`, `htmlTemplate`, `htmlDest`.

0.0.0 &ndash; Initial release.
