"use strict";

const {Endpoint} = require("./endpoint.js");
const middleware = require("./middleware.js");
const {ValidationError} = require("./error.js");
const foursquare = require("../foursquare");

const random = new Endpoint("random");

random.responders.get = function(request, response){
    foursquare.search({latitude: request.latitude, longitude: request.longitude, radius: request.radius, intent: "browse", categoryId: request.categories ? request.categories : "4d4b7105d754a06374d81259"}, (error, foursquareResponse, body) => {
        response.type("application/json").send(body);
    });
};

function floatingPointConvertible(value){
    const result = parseFloat(value);
    return isNaN(result) ? new ValidationError("should be convertible to a floating-point number") : result;
}

random.use(middleware.requireParameters({latitude: floatingPointConvertible, longitude: floatingPointConvertible, radius: floatingPointConvertible}));

module.exports = random;