"use strict";

const utilities = require("../utilities");
const {RequestError} = require("./error.js");

const instanceTest = "EndpointObject";

function handlerExists(request, response, next){
    const errors = [];
    if(!Function.isFunction(this.responders[request.method.toLowerCase()])){
        errors.push(new RequestError(`Method ${request.method} of endpoint ${request.originalUrl.split("?")[0]} is not available`, 405));
    }
    next(...errors); // Array expansion means that it'll have no parameters if no errors, but 1 if there is one
}

function containsRequiredParameters(request, response, next){
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

function sendError(error, request, response, next){
    response.type("text/plain").status(error instanceof RequestError ? error.status : 501).send(error.message);
}

module.exports.Endpoint = class extends require("express").Router{
    constructor(path = ""){
        super()
        this.path = path.startsWith("/") ? path : "/" + path;
        this.responders = {}
        this.listen = module.exports.Endpoint.prototype.listen.reboundTo(this);
        Object.defineProperty(this, "__EndpointInstanceTest", {value: instanceTest, enumerable: false, configurable: false, writable: false});
    }
    listen(server){
        this.use(handlerExists.boundTo(this));
        this.use(containsRequiredParameters.boundTo(this));
        this.use(sendError);
        for(const responder in this.responders){
            if(Function.isFunction(this.responders[responder]) && Function.isFunction(this[responder])){
                let subpath = "/";
                if(typeof this.responders[responder].subpath === "string"){
                    subpath = this.responders[responder].subpath.startsWith("/") ? this.responders[responder].subpath : "/" + this.responders[responder].subpath;
                }
                this[responder](subpath, this.responders[responder].reboundTo(this)); // this.use calls must come before this line
            }
            else{
                throw new TypeError(`"${responder}" is not a valid HTTP responder`);
            }
        }
        this.server = server;
        server.use(this.path, this);
    }
}

module.exports.Endpoint.isInstance = (test) => {
    return test && test.__EndpointInstanceTest === instanceTest;
}