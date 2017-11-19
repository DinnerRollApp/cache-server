"use strict";

const request = require("request");
const {constructRequest} = require("./request-builder.js");

module.exports = (parameters, callback) => {
    parameters.ll = `${parameters.latitude},${parameters.longitude}`;
    delete parameters.latitude;
    delete parameters.longitude;
    request(constructRequest("search", parameters).href, callback);
};