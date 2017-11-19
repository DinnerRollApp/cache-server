"use strict";

const request = require("request");
const {constructRequest} = require("./request-builder.js");

module.exports = (parameters, callback) => {
    request(constructRequest("categories", parameters).href, callback);
};