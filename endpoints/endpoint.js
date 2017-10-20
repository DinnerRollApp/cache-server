"use strict";

require("../utilities.js");

module.exports.Endpoint = class {
    constructor(path = "", shadow){
        this.path = `/${path}`;
        let handler = module.exports.Endpoint.prototype.respond;
        if(shadow instanceof module.exports.Endpoint){
            handler = shadow.respond;
        }
        else if(typeof shadow === "function"){
            handler = shadow;
        }
        this.respond = handler.unbound().bound(this);
    }
    respond(request, response){
        response.status(501).send(`Endpoint "${this.path}" is not implemented`);
    }
    listen(server){
        server.get(this.path, this.respond);
    }
}