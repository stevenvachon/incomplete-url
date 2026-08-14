# incomplete-url [![NPM Version][npm-image]][npm-url] ![Build Status][ghactions-image] [![Coverage Status][codecov-image]][codecov-url]

> Custom-remove features of a [`URL`](https://mdn.io/URL) implementation.


This is useful when simulating the incomplete `URL` implementations available in some web browsers from 2017.


## Installation

[Node.js](http://nodejs.org/) `>= 8` is required. To install, type this at the command line:
```shell
npm install incomplete-url
```


## Usage

```js
const customizeURL = require('incomplete-url');

const options = {
  paramsExclusions: ['sort'],
  urlExclusions: ['origin']
};

const { IncompleteURL, IncompleteURLSearchParams } = customizeURL(options);

const url = new IncompleteURL('http://domain/');
const params = new IncompleteURLSearchParams('param=value');
```


## Options

### `paramsExclusions`
Type: `Array`  
Default value: `[]`  
The output `URLSearchParams` class (and `URL::searchParams`) will not expose each listed property/method when instantiated.

### `urlExclusions`
Type: `Array`  
Default value: `[]`  
The output `URL` class will not expose each listed property/method when instantiated.


[npm-image]: https://img.shields.io/npm/v/incomplete-url
[npm-url]: https://npmjs.com/package/incomplete-url
[ghactions-image]: https://img.shields.io/github/actions/workflow/status/stevenvachon/incomplete-url/test.yml?branch=4.x.x
[codecov-image]: https://img.shields.io/codecov/c/github/stevenvachon/incomplete-url/4.x.x
[codecov-url]: https://app.codecov.io/github/stevenvachon/incomplete-url/tree/4.x.x
