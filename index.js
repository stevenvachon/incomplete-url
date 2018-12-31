"use strict";
const {URL, URLSearchParams} = require("universal-url");



const customizeURL = (options={}) =>
{
	const IncompleteURLSearchParams = function(params)
	{
		if (params instanceof IncompleteURLSearchParams)
		{
			params = params._searchParams;
		}

		this._searchParams = new URLSearchParams(params);

		this[Symbol.iterator] = () => this.entries();
		this[Symbol.toStringTag] = this._searchParams[Symbol.toStringTag];

		// Extend all `URLSearchParams` properties except any exclusions
		getFilteredKeys
		(
			URLSearchParams.prototype,
			options.paramsExclusions
		)
		.forEach(key => this[key] = (...args) =>
		{
			const returnValue = this._searchParams[key](...args);

			if ((key==="append" || key==="delete" || key==="set" || key==="sort") && typeof this._callback==="function")
			{
				this._callback();
			}

			return returnValue;
		});
	};

	const IncompleteURL = function(url, base)
	{
		const setSearchParams = value =>
		{
			this._searchParams = new IncompleteURLSearchParams(value);

			this._searchParams._callback = () =>
			{
				const newValue = this._searchParams.toString();
				this._url.search = newValue === "" ? newValue : `?${newValue}`;
			};
		};

		if (url instanceof IncompleteURL)
		{
			url = url._url;
		}

		if (base instanceof IncompleteURL)
		{
			base = base._url;
		}

		this._url = new URL(url, base);

		setSearchParams(this._url.search);

		this[Symbol.toStringTag] = this._url[Symbol.toStringTag];

		// Extend all `URL` properties except any exclusions
		getFilteredKeys
		(
			URL.prototype,
			options.urlExclusions
		)
		.forEach(key =>
		{
			if (key === "searchParams")
			{
				Object.defineProperty(this, key,
				{
					get: () => this._searchParams
				});
			}
			else
			{
				Object.defineProperty(this, key,
				{
					get: () => this._url[key],
					set: newValue =>
					{
						this._url[key] = newValue;

						if (key === "search")
						{
							setSearchParams(newValue);
						}
						else if (key === "href")
						{
							setSearchParams(this._url.search);
						}
					}
				});
			}
		});
	};

	return { IncompleteURL, IncompleteURLSearchParams };
};



const getFilteredKeys = (source, exclusions=[]) =>
{
	return Object.keys(source).filter(key => !exclusions.includes(key));
};



module.exports = customizeURL;
