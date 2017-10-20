"use strict";

const {Endpoint} = require("./endpoint.js");

module.exports.categories = require("./categories.js");
module.exports.random = require("./random.js");
module.exports.root = new Endpoint(undefined, module.exports.random);
module.exports.listen = (server) => {
    for(const index in module.exports){
        const endpoint = module.exports[index];
        if(endpoint instanceof Endpoint){
            endpoint.listen(server);
        }
    }
};