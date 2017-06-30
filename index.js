"use strict";
const {URL, URLSearchParams} = require("universal-url");



const customizeURL = (options={}) =>
{
	const IncompleteURLSearchParams = function(params)
	{
		this._searchParams = new URLSearchParams(params);

		this[Symbol.iterator] = () => this.entries();
		this[Symbol.toStringTag] = this._searchParams[Symbol.toStringTag];

		// Extend all `URLSearchParams` methods except perhaps `sort`
		Object.keys(URLSearchParams.prototype)
		.filter(key => options.noSort ? key!=="sort" : true)
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

		this._url = new URL(url, base);

		setSearchParams(this._url.search);

		this[Symbol.toStringTag] = this._url[Symbol.toStringTag];

		// Extend all `URL` getters/setters except perhaps `searchParams`
		Object.keys(URL.prototype)
		.filter(key => options.noSearchParams ? key!=="searchParams" : true)
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
					}
				});
			}
		});
	};

	return { IncompleteURL, IncompleteURLSearchParams };
};



module.exports = customizeURL;
