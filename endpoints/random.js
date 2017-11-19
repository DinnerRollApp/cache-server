"use strict";

const {Endpoint} = require("./endpoint.js");
const middleware = require("./middleware.js");
const {ValidationError} = require("./error.js");
const foursquare = require("../foursquare");
const utilities = require("../utilities");

const random = new Endpoint("random");

random.responders.get = function(request, response){
    foursquare.search({latitude: request.latitude, longitude: request.longitude, radius: request.radius, intent: "browse", categoryId: request.categories.length > 0 ? request.categories.join(",") : "4d4b7105d754a06374d81259"}, (error, foursquareResponse, body) => {
        response.send(JSON.parse(body)["response"]["venues"].randomElement);
    });
};

function floatingPointConvertible(value){
    const result = parseFloat(value);
    return isNaN(result) ? new ValidationError("should be convertible to a floating-point number") : result;
}

random.use(middleware.requireParameters({latitude: floatingPointConvertible, longitude: floatingPointConvertible, radius: floatingPointConvertible}));
random.use((request, response, next) => {
    if(request.query.categories){
        request.categories = request.query.categories.split(",");
    }
    else{
        request.categories = [];
    }
    next();
});

module.exports = random;