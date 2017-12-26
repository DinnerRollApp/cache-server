"use strict";

const request = require("request-promise-native");
const {constructRequest} = require("./request-builder.js");

module.exports = async () => {
    return await request(constructRequest("categories"));
};