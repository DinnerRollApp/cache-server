"use strict";

const {Endpoint} = require("./endpoint.js");
const supportedCodes = require("../utilities").supportedLanguageCodes;

module.exports = new Endpoint("locales");

module.exports.responders.get = function(request, response) {
    // Caching up to a week is ok
    response.header("Cache-Control", "public, max-age=604800").json(supportedCodes);
}