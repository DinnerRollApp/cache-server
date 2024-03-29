"use strict";

const {Endpoint} = require("./endpoint.js");

// Module configuration for external requires
module.exports.categories = require("./categories.js");
module.exports.random = require("./random.js");
module.exports.locales = require("./locales.js");
module.exports.middleware = require("./middleware.js");
module.exports.restaurant = require("./restaurant.js");
module.exports.listen = (server) => {
    for(const index in module.exports){
        const endpoint = module.exports[index];
        if(Endpoint.isInstance(endpoint)){
            endpoint.listen(server);
        }
    }
};