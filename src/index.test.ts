import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import customizeURL from './index.ts';
import { PARAMS_METHODS, PARAMS_PROPERTIES, URL_METHODS, URL_PROPERTIES } from './constants.ts';

const PARAMS_KEYS = [...PARAMS_METHODS, ...PARAMS_PROPERTIES] as const;
const URL_KEYS = [...URL_METHODS, ...URL_PROPERTIES] as const;
const UNEXCLUDABLE_KEYS = ['toString'] as const;

const PARAMS_STRING = 'param=value';
const URL_STRING = `http://hostname?${PARAMS_STRING}`;

/**
 * Get the value of a property on a `URL` or `URLSearchParams` instance.
 * TypeScript doesn't include `Symbol.toStringTag` in its types, so this is cleaner than `@ts-expect-error`.
 */
const getProperty = (obj: object, key: PropertyKey) => (obj as Record<PropertyKey, unknown>)[key];

const isUnexcludableKey = (key: PropertyKey) =>
  (UNEXCLUDABLE_KEYS as readonly PropertyKey[]).includes(key);

/**
 * Add encapsulating quotes to a string, but not a `Symbol`.
 */
const quoteProperty = (key: PropertyKey) =>
  typeof key === 'symbol' ? String(key.description) : `"${key}"`;

const removeExcludableKeys = (keys: readonly PropertyKey[]) => keys.filter(isUnexcludableKey);

const removeUnexcludableKeys = (keys: readonly PropertyKey[]) =>
  keys.filter(key => !isUnexcludableKey(key));

/**
 * Set the value of a property on a `URL` or `URLSearchParams` instance.
 * TypeScript doesn't include `Symbol.toStringTag` in its types, so this is cleaner than `@ts-expect-error`.
 */
const setProperty = (obj: object, key: PropertyKey, value: unknown) =>
  ((obj as Record<PropertyKey, unknown>)[key] = value);

describe('Default behavior', () => {
  it('is the same as the global', () => {
    const args = ['arg1', 'arg2'];
    const { IncompleteURL, IncompleteURLSearchParams } = customizeURL();
    const nativeParams = new URLSearchParams(PARAMS_STRING);
    const nativeURL = new URL(URL_STRING);
    const params = new IncompleteURLSearchParams(PARAMS_STRING);
    const url = new IncompleteURL(URL_STRING);

    PARAMS_KEYS.forEach(key => expect(key in params).toBe(key in nativeParams));
    URL_KEYS.forEach(key => expect(key in url).toBe(key in nativeURL));

    PARAMS_PROPERTIES.forEach(property =>
      expect(getProperty(params, property)).toBe(getProperty(nativeParams, property))
    );

    // Get
    URL_PROPERTIES.forEach(property => {
      if (property === 'searchParams') {
        expect(Array.from(url.searchParams)).toEqual(Array.from(nativeURL.searchParams));
      } else {
        expect(getProperty(url, property)).toBe(getProperty(nativeURL, property));
      }
    });

    // Set, then get
    URL_PROPERTIES.filter(p => !['origin', 'searchParams', Symbol.toStringTag].includes(p)).forEach(
      property => {
        const value =
          property === 'href' ? 'https://hostname2' : property === 'port' ? '123' : 'value';
        setProperty(url, property, value);
        setProperty(nativeURL, property, value);
        expect(getProperty(url, property)).toBe(getProperty(nativeURL, property));
      }
    );

    PARAMS_METHODS.forEach(method => {
      const prototype = URLSearchParams.prototype as unknown as Record<
        PropertyKey,
        (...args: unknown[]) => unknown
      >;
      const spy = vi.spyOn(prototype, method).mockReturnValue(undefined);

      (getProperty(params, method) as (...args: unknown[]) => unknown)(...args);

      expect(spy).toHaveBeenCalledWith(...args);
      spy.mockRestore();
    });

    URL_METHODS.forEach(method => {
      const prototype = URL.prototype as unknown as Record<
        PropertyKey,
        (...args: unknown[]) => unknown
      >;
      const spy = vi.spyOn(prototype, method).mockReturnValue('');

      (getProperty(url, method) as (...args: unknown[]) => unknown)(...args);

      expect(spy).toHaveBeenCalledWith(...args);
      spy.mockRestore();
    });
  });

  it('synchronizes search and searchParams', () => {
    const { IncompleteURL } = customizeURL();
    const url = new IncompleteURL(URL_STRING);

    url.search = '';
    expect(Array.from(url.searchParams)).toEqual([]);

    url.searchParams.set('param', 'value');
    expect(url.search).toBe('?param=value');

    url.searchParams.delete('param');
    expect(url.search).toBe('');

    url.search = '?p2=value2&p1=value&p2=value1';
    url.searchParams.sort();
    expect(url.search).toBe('?p1=value&p2=value2&p2=value1');
    expect(url.href).toBe('http://hostname/?p1=value&p2=value2&p2=value1');

    url.href = 'http://hostname2/?new';
    expect(Array.from(url.searchParams)).toEqual([['new', '']]);

    url.pathname = '/path/to';
    expect(url.href).toBe('http://hostname2/path/to?new');
  });

  it('rejects assignment to searchParams', () => {
    const { IncompleteURL, IncompleteURLSearchParams } = customizeURL();
    const nativeParams = new URLSearchParams(PARAMS_STRING);
    const nativeUrl = new URL(URL_STRING);
    const params = new IncompleteURLSearchParams(PARAMS_STRING);
    const url = new IncompleteURL(URL_STRING);

    expect(() => {
      (nativeUrl as { searchParams: unknown }).searchParams = nativeParams;
    }).toThrow(TypeError);

    expect(() => {
      (url as { searchParams: unknown }).searchParams = params;
    }).toThrow(TypeError);
  });

  it('accepts instances as input', () => {
    const { IncompleteURL, IncompleteURLSearchParams } = customizeURL();
    const params = new IncompleteURLSearchParams(PARAMS_STRING);
    const url = new IncompleteURL(URL_STRING);

    expect(new IncompleteURL(url)).toBeInstanceOf(IncompleteURL);
    expect(new IncompleteURL('/path/', url)).toBeInstanceOf(IncompleteURL);
    expect(new IncompleteURLSearchParams(params)).toBeInstanceOf(IncompleteURLSearchParams);
  });
});

describe('Unavailable properties/methods', () => {
  beforeEach(() => {
    const { IncompleteURL, IncompleteURLSearchParams } = customizeURL({
      paramsExclusions: ['sort', Symbol.iterator],
      urlExclusions: ['origin', Symbol.toStringTag],
    });
    vi.stubGlobal('URL', IncompleteURL);
    vi.stubGlobal('URLSearchParams', IncompleteURLSearchParams);
  });

  afterEach(() => vi.unstubAllGlobals());

  it('does not attempt to wrap them', () => {
    const { IncompleteURL, IncompleteURLSearchParams } = customizeURL();
    const params = new IncompleteURLSearchParams(PARAMS_STRING);
    const url = new IncompleteURL(URL_STRING);
    expect('sort' in params).toBe(false);
    expect(Symbol.iterator in params).toBe(false);
    expect('origin' in url).toBe(false);
    expect(Symbol.toStringTag in url).toBe(false);
    expect('sort' in url.searchParams).toBe(false);
  });
});

describe('Exclusions', () => {
  describe('urlExclusions', () => {
    removeUnexcludableKeys(URL_KEYS).forEach(key =>
      it(quoteProperty(key), () => {
        const { IncompleteURL } = customizeURL({ urlExclusions: [key] });
        const url = new IncompleteURL(URL_STRING);
        expect(key in url).toBe(false);
      })
    );
  });

  describe('paramsExclusions', () => {
    removeUnexcludableKeys(PARAMS_KEYS).forEach(key =>
      it(quoteProperty(key), () => {
        const { IncompleteURL, IncompleteURLSearchParams } = customizeURL({
          paramsExclusions: [key],
        });
        const params = new IncompleteURLSearchParams(PARAMS_STRING);
        const url = new IncompleteURL(URL_STRING);
        expect(key in params).toBe(false);
        expect(key in url.searchParams).toBe(false);
      })
    );
  });

  it('all known methods/properties', () => {
    const { IncompleteURL, IncompleteURLSearchParams } = customizeURL({
      paramsExclusions: PARAMS_KEYS,
      urlExclusions: URL_KEYS,
    });
    const params = new IncompleteURLSearchParams(PARAMS_STRING);
    const url = new IncompleteURL(URL_STRING);
    removeExcludableKeys(URL_KEYS).forEach(key => expect(key in url).toBe(true));
    removeUnexcludableKeys(URL_KEYS).forEach(key => expect(key in url).toBe(false));
    removeExcludableKeys(PARAMS_KEYS).forEach(key => expect(key in params).toBe(true));
    removeUnexcludableKeys(PARAMS_KEYS).forEach(key => expect(key in params).toBe(false));
  });

  it('unsupported', () =>
    expect(() => {
      const { IncompleteURL, IncompleteURLSearchParams } = customizeURL({
        paramsExclusions: ['non-existent'],
        urlExclusions: ['non-existent'],
      });
      new IncompleteURL(URL_STRING);
      new IncompleteURLSearchParams(PARAMS_STRING);
    }).not.toThrow());
});
