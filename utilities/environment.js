const envalid = require("envalid");

const keyPrefix = "DINNERROLL_";

function keyForBase(base){
    base = base.toUpperCase().trim().replace(/\s+/g, "_"); // Capitalize, trim whitespace from the edges, and replace any whitespace in the middle with underscores
    return base.startsWith(keyPrefix) ? base : keyPrefix + base.toUpperCase();
}

let expectation = {};
expectation[keyForBase("VERSION")] = envalid.num({default: 1, desc: "The current external version of the API, used to test frontend compatiblility", example: 1});
expectation[keyForBase("SECRET")] = envalid.str({desc: "Client secret to add a little more than just security by obscurity"});
expectation[keyForBase("FOURSQUARE_CLIENT_ID")] = envalid.str({desc: "Client ID to interface with the Foursquare API"});
expectation[keyForBase("FOURSQUARE_CLIENT_SECRET")] = envalid.str({desc: "Client secret to interface with the Foursquare API"});

module.exports = envalid.cleanEnv(null, expectation, {transformer: (environment) => {
    environment.valueForKey = (key) => {
        return environment[keyForBase(key)];
    };
    return environment;
}});