# incomplete-url [![NPM Version][npm-image]][npm-url] ![Build Status][ghactions-image] [![Coverage Status][codecov-image]][codecov-url]

> Custom-remove features of a [`URL`](https://mdn.io/URL) implementation.

This is useful when simulating the incomplete `URL` implementations available in some web browsers from 2017.

> [!NOTE]
>
> If you need to support older versions of Node.js (going back to `8.x`), use `4.x` of this package.

## Install

```shell
npm install incomplete-url
```

## Usage

```js
import customizeURL from 'incomplete-url';

const options = {
  paramsExclusions: ['sort'],
  urlExclusions: ['origin'],
};

const { IncompleteURL, IncompleteURLSearchParams } = customizeURL(options);

const url = new IncompleteURL('http://domain/');
const params = new IncompleteURLSearchParams('param=value');
```

[npm-image]: https://img.shields.io/npm/v/incomplete-url
[npm-url]: https://npmjs.com/package/incomplete-url
[ghactions-image]: https://img.shields.io/github/actions/workflow/status/stevenvachon/incomplete-url/test.yml
[codecov-image]: https://img.shields.io/codecov/c/github/stevenvachon/incomplete-url
[codecov-url]: https://app.codecov.io/github/stevenvachon/incomplete-url
