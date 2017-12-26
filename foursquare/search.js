"use strict";

const request = require("request-promise-native");
const {constructRequest} = require("./request-builder.js");

module.exports = async (parameters) => {
    parameters.ll = `${parameters.latitude},${parameters.longitude}`;
    delete parameters.latitude;
    delete parameters.longitude;
    return await request(constructRequest("search", parameters));
};