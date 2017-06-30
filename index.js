"use strict";
const {URL, URLSearchParams} = require("universal-url");



const customizeURL = (options={}) =>
{
	const IncompleteURLSearchParams = function(params)
	{
		this._searchParams = new URLSearchParams(params);

		// Support iteration and `Array.from()`
		this[Symbol.iterator] = () => this.entries();

		this[Symbol.toStringTag] = this._searchParams[Symbol.toStringTag];

		// Extend all `URLSearchParams` methods except `sort`
		Object.keys(URLSearchParams.prototype)
		.filter(key => 
		{
			if (options.noSort)
			{
				return key !== "sort";
			}
			else
			{
				return true;
			}
		})
		.forEach(key => this[key] = (...args) => this._searchParams[key].call(this._searchParams, ...args));
	};

	const IncompleteURL = function(url, base)
	{
		this._url = new URL(url, base);
		this._searchParams = new IncompleteURLSearchParams(this._url.search);

		this[Symbol.toStringTag] = this._url[Symbol.toStringTag];

		// Extend all `URL` getters except perhaps `searchParams`
		Object.keys(URL.prototype)
		.filter(key =>
		{
			if (options.noSearchParams)
			{
				return key !== "searchParams";
			}
			else
			{
				return true;
			}
		})
		.forEach(key =>
		{
			if (key === "searchParams")
			{
				Object.defineProperty(this, key,
				{
					get: () => this._searchParams,
					set: newValue => this._searchParams = newValue
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
							this._searchParams = new IncompleteURLSearchParams(newValue);
						}
					}
				});
			}
		});

		//this.search = "";
		this.searchParams.append("body", "value")
		console.log(Array.from(this.searchParams))
	};

	return { IncompleteURL, IncompleteURLSearchParams };
};



module.exports = customizeURL;
