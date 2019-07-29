"use strict";

const {Endpoint} = require("./endpoint.js");
const supportedCodes = require("../utilities").supportedLanguageCodes;

module.exports = new Endpoint("locales");

module.exports.responders.get = function(request, response) {
    response.json(supportedCodes);
}