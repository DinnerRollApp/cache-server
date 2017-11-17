"use strict";

const filesystem = require("fs");
const {URL} = require("url");
const {Endpoint} = require("./endpoint.js");
const foursquare = require("../foursquare");

module.exports = new Endpoint("categories");

module.exports.responders.get = function(request, response){
    foursquare.categories((error, foursquareResponse, body) => {
        console.info(error, foursquareResponse);
        response.type("application/json").send(body);
    });
};