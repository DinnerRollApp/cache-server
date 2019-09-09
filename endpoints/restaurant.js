"use strict";

const {Endpoint} = require("./endpoint.js");
const foursquare = require("../foursquare");
const utilities = require("../utilities");
const defaultMiddleware = require("./middleware.js");

const IDKey = "restaurantID";
module.exports = new Endpoint("restaurants/:" + IDKey);

