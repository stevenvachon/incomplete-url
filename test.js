"use strict";
const customizeURL = require("./");
const {describe, it} = require("mocha");
const {expect} = require("chai");

const paramsProperties =
[
	"append",
	"delete",
	"entries",
	"get",
	"getAll",
	"has",
	"keys",
	"set",
	"sort",
	// "toString" excluded because Object::toString exists
	"values"
];

const urlProperties =
[
	"hash",
	"host",
	"hostname",
	"href",
	"origin",
	"password",
	"pathname",
	"port",
	"protocol",
	"search",
	"toJSON",
	// "toString" excluded because Object::toString exists
	"username"
];



it("behaves no differently by default", () =>
{
	const {IncompleteURL, IncompleteURLSearchParams} = customizeURL();

	const params = new IncompleteURLSearchParams("param=value");
	const url = new IncompleteURL("http://hostname?param=value");

	expect(params).to.have.property("sort");
	expect(url).to.have.property("searchParams");
	expect(url.searchParams).to.have.property("sort");

	expect(params[Symbol.toStringTag]).to.equal("URLSearchParams");
	expect(url[Symbol.toStringTag]).to.equal("URL");

	expect(Array.from(params)).to.deep.equal([ ["param","value"] ]);
	expect(Array.from(url.searchParams)).to.deep.equal([ ["param","value"] ]);

	params.append("param", "value2");
	const iteration = [];
	for (let param of params) iteration.push(param);
	expect(iteration).to.deep.equal([ ["param","value"], ["param","value2"] ]);
	expect(params.toString()).to.equal("param=value&param=value2")

	expect(() => url.searchParams = params).to.throw(TypeError);

	url.search = "";
	expect(Array.from(url.searchParams)).to.deep.equal([]);

	url.searchParams.set("param", "value");
	expect(url.search).to.equal("?param=value");

	url.searchParams.delete("param");
	expect(url.search).to.equal("");

	url.search = "?p2=value2&p1=value&p2=value1";
	url.searchParams.sort();
	expect(url.search).to.equal("?p1=value&p2=value2&p2=value1");
	expect(url.href).to.equal("http://hostname/?p1=value&p2=value2&p2=value1");

	url.href = "http://hostname2/?new";
	expect(Array.from(url.searchParams)).to.deep.equal([ ["new",""] ]);

	url.pathname = "/path/to";
	expect(url.href).to.equal("http://hostname2/path/to?new");

	expect(new IncompleteURL(url)).to.be.an.instanceOf(IncompleteURL);
	expect(new IncompleteURL("/path/", url)).to.be.an.instanceOf(IncompleteURL);
	expect(new IncompleteURLSearchParams(params)).to.be.an.instanceOf(IncompleteURLSearchParams);
});



describe("options", () =>
{
	const paramsString = "param=value";
	const urlString = `http://hostname?${paramsString}`;



	describe("urlExclusions", () =>
	{
		urlProperties.forEach(prop => it(`"${prop}"`, () =>
		{
			const options = { urlExclusions:[prop] };
			const {IncompleteURL, IncompleteURLSearchParams} = customizeURL(options);

			const url = new IncompleteURL(urlString);

			expect(url).to.not.have.property(prop);
		}));



		it("all properties", () =>
		{
			const options = { urlExclusions:urlProperties };
			const {IncompleteURL, IncompleteURLSearchParams} = customizeURL(options);

			const url = new IncompleteURL(urlString);

			urlProperties.forEach(prop => expect(url).to.not.have.property(prop));
		});
	});



	describe("paramsExclusions", () =>
	{
		paramsProperties.forEach(prop => it(`"${prop}"`, () =>
		{
			const options = { paramsExclusions:[prop] };
			const {IncompleteURL, IncompleteURLSearchParams} = customizeURL(options);

			const params = new IncompleteURLSearchParams(paramsString);
			const url = new IncompleteURL(urlString);

			expect(params).to.not.have.property(prop);
			expect(url.searchParams).to.not.have.property(prop);
		}));



		it("all properties", () =>
		{
			const options = { paramsExclusions:paramsProperties };
			const {IncompleteURL, IncompleteURLSearchParams} = customizeURL(options);

			const params = new IncompleteURLSearchParams(paramsString);
			const url = new IncompleteURL(urlString);

			urlProperties.forEach(prop =>
			{
				expect(params).to.not.have.property(prop);
				expect(url.searchParams).to.not.have.property(prop);
			});
		});
	});



	describe("paramsExclusions && urlExclusions", () =>
	{
		it("does not cause conflicts", () =>
		{
			const options = { paramsExclusions:["sort"], urlExclusions:["searchParams"] };
			const {IncompleteURL, IncompleteURLSearchParams} = customizeURL(options);

			const params = new IncompleteURLSearchParams(paramsString);
			const url = new IncompleteURL(urlString);

			expect(params).to.not.have.property("sort");
			expect(url).to.not.have.property("searchParams");
		});
	});
});
