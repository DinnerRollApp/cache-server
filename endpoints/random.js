"use strict";

const {Endpoint} = require("./endpoint.js");

const random = new Endpoint("random");

random.responders.get = function(request, response){
    response.type("text/plain").send(this.path);
}

module.exports = random;