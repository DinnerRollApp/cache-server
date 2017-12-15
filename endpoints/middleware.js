"use strict";

const {RequestError, ValidationError} = require("./error.js");
const utilities = require("../utilities");

module.exports.handlerExists = function(request, response, next){
    const errors = [];
    if(!Function.isFunction(this.responders[request.method.toLowerCase()])){
        errors.push(new RequestError(`Method ${request.method} of endpoint ${request.originalUrl.split("?")[0]} is not available`, 405));
    }
    next(...errors); // Array expansion means that it'll have no parameters if no errors, but 1 if there is one
};

module.exports.requireParameters = (parameters) => {
    return (request, response, next) => {
        for(const key in parameters){
            if(request.query[key]){
                let result;
                try{
                    result = parameters[key](request.query[key]);
                }
                catch(error){
                    result = error;
                }
                if(result instanceof ValidationError){ // If the parameter explicitly failed validation, but exists
                    next(new RequestError(`The parameter "${key}" was invalid. It should ${result.expectation}.`));
                }
                else if(result instanceof Error){ // If the validation procedure failed to complete
                    next(result);
                }
                else{ // This check passed
                    request[key] = result;
                }
            }
            else{ // If the parameter was not provided
                next(new RequestError(`The required parameter ${key} was missing`));
            }
        }
        next(); // All checks passed
    };
};

module.exports.matchesRequiredParameters = function(request, response, next){
    for(const key of ["version", "secret"]){
        if(request.query[key] === utilities.environment.valueForKey(key).toString()){
            request[key] = request.query[key];
        }
        else{
            next(new RequestError(`The parameter "${key}" did not match the required value`));
            return;
        }
    }
    next();
};

module.exports.connectCache = function(request, response, next){
    request.cache = require("../utilities").cache;
    next();
};

module.exports.sendError = (error, request, response, next) => {
    response.status(typeof error.status === "number" ? error.status : 500).send({error: error.message});
};