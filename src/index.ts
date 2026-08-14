import {
  PARAMS_METHODS,
  PARAMS_METHODS_WRITEONLY,
  PARAMS_PROPERTIES,
  URL_METHODS,
  URL_PROPERTIES,
} from './constants.ts';

export type CustomizeURLOptions = {
  /**
   * The properties/methods to hide/remove from the output `URLSearchParams` class (and `URL::searchParams`).
   */
  paramsExclusions?: readonly PropertyKey[];
  /**
   * The properties/methods to hide/remove from the output `URL` class.
   */
  urlExclusions?: readonly PropertyKey[];
};

type URLSearchParamsInit = ConstructorParameters<typeof URLSearchParams>[0];

/**
 * Custom-remove features of a [`URL`](https://mdn.io/URL) implementation.
 */
export default ({ paramsExclusions = [], urlExclusions = [] }: CustomizeURLOptions = {}) => {
  // For tests: uses the global value when this function is called instead of when instances are created
  const globalURL = URL;
  const globalURLSearchParams = URLSearchParams;

  class IncompleteURLSearchParams {
    #searchParams: URLSearchParams;

    constructor(params?: URLSearchParamsInit | IncompleteURLSearchParams) {
      if (params instanceof IncompleteURLSearchParams) {
        params = params.#searchParams;
      }

      this.#searchParams = new globalURLSearchParams(params);

      // Forward instance methods to `#searchParams`
      PARAMS_METHODS.filter(
        method =>
          !(paramsExclusions.includes(method) || typeof this.#searchParams[method] !== 'function')
      ).forEach(method =>
        Object.defineProperty(this, method, {
          configurable: true,
          value: (...args: unknown[]) =>
            (this.#searchParams[method] as (...args: unknown[]) => unknown)(...args),
        })
      );

      // Forward instance properties to `#searchParams`
      PARAMS_PROPERTIES.filter(
        property =>
          !(paramsExclusions.includes(property) || !(property in Object(this.#searchParams)))
      ).forEach(property =>
        Object.defineProperty(this, property, {
          get: () => (this.#searchParams as unknown as Record<PropertyKey, unknown>)[property],
        })
      );
    }
  }

  class IncompleteURL {
    #searchParams!: IncompleteURLSearchParams;
    #url: URL;

    constructor(url: string | URL | IncompleteURL, base?: string | URL | IncompleteURL) {
      if (url instanceof IncompleteURL) {
        url = url.#url;
      }

      if (base instanceof IncompleteURL) {
        base = base.#url;
      }

      this.#url = new globalURL(url, base);

      this.#setSearchParams(this.#url.search);

      // Forward instance methods to `#url`
      URL_METHODS.filter(
        method => !(urlExclusions.includes(method) || typeof this.#url[method] !== 'function')
      ).forEach(method =>
        Object.defineProperty(this, method, {
          value: (...args: unknown[]) =>
            (this.#url[method] as (...args: unknown[]) => unknown)(...args),
        })
      );

      // Forward instance properties to `#url`
      URL_PROPERTIES.filter(
        property => !(urlExclusions.includes(property) || !(property in Object(this.#url)))
      ).forEach(property => {
        if (property === 'searchParams') {
          Object.defineProperty(this, property, {
            get: () => this.#searchParams,
          });
        } else {
          const descriptor = Object.getOwnPropertyDescriptor(globalURL.prototype, property);

          Object.defineProperty(this, property, {
            get: () => (this.#url as unknown as Record<PropertyKey, unknown>)[property],
            ...(descriptor?.set && {
              set: (newValue: unknown) => {
                (this.#url as unknown as Record<PropertyKey, unknown>)[property] = newValue;

                if (property === 'href' || property === 'search') {
                  this.#setSearchParams(this.#url.search);
                }
              },
            }),
          });
        }
      });
    }

    #setSearchParams(value: URLSearchParamsInit) {
      this.#searchParams = new IncompleteURLSearchParams(value);

      // Sync with `IncompleteURLSearchParams` changes
      PARAMS_METHODS_WRITEONLY.forEach(method => {
        const original = (this.#searchParams as unknown as Record<PropertyKey, unknown>)[method];
        if (typeof original !== 'function') {
          return;
        }

        Object.defineProperty(this.#searchParams, method, {
          value: (...args: unknown[]) => {
            const returnValue = original(...args);
            const search = this.#searchParams.toString(); // Likely no one will exclude `toString`
            this.#url.search = search === '' ? search : `?${search}`;
            return returnValue;
          },
        });
      });
    }
  }

  return {
    IncompleteURL,
    IncompleteURLSearchParams,
  } as unknown as {
    IncompleteURL: new (url: string | URL, base?: string | URL) => URL;
    IncompleteURLSearchParams: new (init?: URLSearchParamsInit) => URLSearchParams;
  };
};
