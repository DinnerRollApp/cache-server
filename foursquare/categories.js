"use strict";

const request = require("request");
const {constructRequest} = require("./request-builder.js");

module.exports = (callback) => {
    request(constructRequest("categories").href, callback);
};