"use strict";
const customizeURL = require("./");
const {expect} = require("chai");
const {it} = require("mocha");



it("noSearchParams = true", function()
{
	const options = { noSearchParams:true };
	const {IncompleteURL, IncompleteURLSearchParams} = customizeURL(options);

	const url = new IncompleteURL("http://hostname?param=value");

	expect(url).to.not.have.property("searchParams");
});
