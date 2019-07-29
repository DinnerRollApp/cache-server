"use strict";

const request = require("request-promise-native");
const {constructRequest} = require("./request-builder.js");

module.exports = async (parameters, language) => {
    parameters.ll = `${parameters.latitude},${parameters.longitude}`;
    delete parameters.latitude;
    delete parameters.longitude;
    return await request(constructRequest("search", parameters, language ? {"Accept-Language": language} : null));
};