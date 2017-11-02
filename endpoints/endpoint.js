"use strict";

require("../utilities");

const instanceTest = "EndpointObject";

function requestTest(request, response, next){
    if(this.responders[request.method.toLowerCase()] != "function"){
        const message = `Method ${request.method} of endpoint ${request.path} is not implemented`
        response.type("text/plain").status(501).send(message);
    }
    else{
        next();
    }
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
        for(const responder in this.responders){
            if(Function.isFunction(this.responders[responder]) && Function.isFunction(this[responder])){
                let subpath = "/";
                if(typeof this.responders[responder].subpath === "string"){
                    subpath = this.responders[responder].subpath.startsWith("/") ? this.responders[responder].subpath : "/" + this.responders[responder].subpath;
                }
                //FIXME: Logic error here
                this[responder](subpath, this.responders[responder].reboundTo(this));
            }
            else{
                throw new TypeError(`"${responder}" is not a valid HTTP responder`);
            }
        }
        this.use(requestTest.boundTo(this));
        server.use(this.path, this);
        this.server = server;
    }
}

module.exports.Endpoint.isInstance = (test) => {
    return test && test.__EndpointInstanceTest === instanceTest;
}