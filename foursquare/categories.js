"use strict";

const request = require("request-promise-native");
const {constructRequest} = require("./request-builder.js");

module.exports = async (language) => {
    return await request(constructRequest("categories", null, language ? {"Accept-Language": language} : null));
};