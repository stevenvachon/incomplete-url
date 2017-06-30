# incomplete-url [![NPM Version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Dependency Monitor][greenkeeper-image]][greenkeeper-url]

> Custom-remove features of a WHATWG [`URL`](https://developer.mozilla.org/en/docs/Web/API/URL) implementation.


This is useful when simulating the incomplete `URL` implementations available in some of today's modern web browsers.


## Installation

[Node.js](http://nodejs.org/) `>= 6` is required. To install, type this at the command line:
```shell
npm install incomplete-url
```


## Usage

```js
const customizeURL = require('incomplete-url');

const {IncompleteURL, IncompleteURLSearchParams} = customizeURL(options);

const url = new IncompleteURL('http://domain/');
const params = new IncompleteURLSearchParams('?param=value');
```


## Options

### `noSearchParams`
Type: `Boolean`  
Default value: `false`  
When set to `true`, the output `URL` class will not expose a `searchParams` property when instantiated.

### `noSort`
Type: `Boolean`  
Default value: `false`  
When set to `true`, the output `URLSearchParams` class (and `URL#searchParams`) will not expose a `sort` method when instantiated.


[npm-image]: https://img.shields.io/npm/v/incomplete-url.svg
[npm-url]: https://npmjs.org/package/incomplete-url
[travis-image]: https://img.shields.io/travis/stevenvachon/incomplete-url.svg
[travis-url]: https://travis-ci.org/stevenvachon/incomplete-url
[coveralls-image]: https://img.shields.io/coveralls/stevenvachon/incomplete-url.svg
[coveralls-url]: https://coveralls.io/github/stevenvachon/incomplete-url
[greenkeeper-image]: https://badges.greenkeeper.io/stevenvachon/incomplete-url.svg
[greenkeeper-url]: https://greenkeeper.io/
