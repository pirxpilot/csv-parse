[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

# @pirxpilot/csv-parse

Minimal CSV parser implemented using web `TransformStream`

## Install

```sh
$ npm install --save @pirxpilot/csv-parse
```

## Usage

```js
const res = await fetch('http://example.com/cities.csv');
const stream = res.body
  .pipeThrough(new TextDecoderStream())
  .pipeThrough(new CsvLineStream({ trim: true }));

for await (const line of stream) {
  console.log('Line: %s', line);
}
```

## License

MIT © [Damian Krzeminski](https://pirxpilot.me)

[npm-image]: https://img.shields.io/npm/v/@pirxpilot/csv-parse
[npm-url]: https://npmjs.org/package/@pirxpilot/csv-parse

[build-url]: https://github.com/pirxpilot/csv-parse/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/actions/workflow/status/pirxpilot/csv-parse/check.yaml?branch=main

[deps-image]: https://img.shields.io/librariesio/release/npm/@pirxpilot/csv-parse
[deps-url]: https://libraries.io/npm/@pirxpilot%2Fcsv-parse
