"use strict";
const customizeURL = require("./");
const {describe, it} = require("mocha");
const {expect} = require("chai");



it("behaves no differently by default", function()
{
	const {IncompleteURL, IncompleteURLSearchParams} = customizeURL();

	const params = new IncompleteURLSearchParams("?param=value");
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

	url.search = "?p2=value2&p1=value&p2=value1";
	url.searchParams.sort();
	expect(url.search).to.equal("?p1=value&p2=value2&p2=value1");
	expect(url.href).to.equal("http://hostname/?p1=value&p2=value2&p2=value1");
});



describe("options", function()
{
	it("noSearchParams = true", function()
	{
		const options = { noSearchParams:true };
		const {IncompleteURL, IncompleteURLSearchParams} = customizeURL(options);

		const url = new IncompleteURL("http://hostname?param=value");

		expect(url).to.not.have.property("searchParams");
	});



	it("noSort = true", function()
	{
		const options = { noSort:true };
		const {IncompleteURL, IncompleteURLSearchParams} = customizeURL(options);

		const params = new IncompleteURLSearchParams("?param=value");
		const url = new IncompleteURL("http://hostname?param=value");

		expect(params).to.not.have.property("sort");
		expect(url.searchParams).to.not.have.property("sort");
	});



	it("all options true", function()
	{
		const options = { noSearchParams:true, noSort:true };
		const {IncompleteURL, IncompleteURLSearchParams} = customizeURL(options);

		const params = new IncompleteURLSearchParams("?param=value");
		const url = new IncompleteURL("http://hostname?param=value");

		expect(params).to.not.have.property("sort");
		expect(url).to.not.have.property("searchParams");
	});
});
