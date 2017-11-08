"use strict";

const {RequestError} = require("./error.js");
const utilities = require("../utilities");

module.exports.handlerExists = function(request, response, next){
    const errors = [];
    if(!Function.isFunction(this.responders[request.method.toLowerCase()])){
        errors.push(new RequestError(`Method ${request.method} of endpoint ${request.originalUrl.split("?")[0]} is not available`, 405));
    }
    next(...errors); // Array expansion means that it'll have no parameters if no errors, but 1 if there is one
}

module.exports.containsRequiredParameters = function(request, response, next){
    for(const key of ["version", "secret"]){
        if(request.query[key] === utilities.environment.valueForKey(key).toString()){
            request[key] = request.query[key];
        }
        else{
            next(new RequestError(`The parameter ${key} is required, but was not specified`, 400));
            return;
        }
    }
    next();
}

module.exports.sendError = (error, request, response, next) => {
    response.type("text/plain").status(error instanceof RequestError ? error.status : 501).send(error.message);
}