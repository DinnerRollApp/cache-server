"use strict";

const defaultMiddleware = require("./middleware.js");

const instanceTest = "EndpointObject";
const instanceTestProperty = "__EndpointInstanceTest";

module.exports.Endpoint = class extends require("express").Router{
    constructor(path = ""){
        super();
        this.path = path.startsWith("/") ? path : "/" + path;
        this.responders = {};
        this.middleware = [];
        this.listen = module.exports.Endpoint.prototype.listen.reboundTo(this);
        Object.defineProperty(this, instanceTestProperty, {value: instanceTest, enumerable: false, configurable: false, writable: false});
    }
    listen(server){
        this.use(defaultMiddleware.handlerExists.boundTo(this));
        this.use(defaultMiddleware.matchesRequiredParameters.boundTo(this));
        for(const transformer of this.middleware){
            this.use(transformer);
        }
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
};

module.exports.Endpoint.isInstance = (test) => {
    return test && test[instanceTestProperty] === instanceTest;
};