"use strict";

const envalid = require("envalid");

const keyPrefix = "DINNERROLL_";

function keyForBase(base){
    return base.toUpperCase().trim().replace(/\s+/g, "_"); // Capitalize, trim whitespace from the edges, and replace any whitespace in the middle with underscores
}

let expectation = {};
expectation[keyForBase("VERSION")] = envalid.num({default: 1, desc: "The current external version of the API, used to test frontend compatiblility", example: 1});
expectation[keyForBase("SECRET")] = envalid.str({desc: "Client secret to add a little more than just security by obscurity"});
expectation[keyForBase("FOURSQUARE_CLIENT_ID")] = envalid.str({desc: "Client ID to interface with the Foursquare API"});
expectation[keyForBase("FOURSQUARE_CLIENT_SECRET")] = envalid.str({desc: "Client secret to interface with the Foursquare API"});
expectation[keyForBase("REDIS_PASSWORD")] = envalid.str({desc: "Password to authenticate with the Redis instance", devDefault: undefined});
expectation[keyForBase("REDIS_SOCKET")] = envalid.makeValidator((value) => {
    value = value.trim();
    if(value.length > 0){
        return value;
    }
    else{
        throw new Error("Expected a non-empty string");
    }
}, "trimmed, non-empty string")({desc: "Path to the UNIX socket that connects to the Redis instance", example: "/var/run/redis/redis.sock", devDefault: undefined});

module.exports = envalid.cleanEnv(process.env, expectation, {transformer: (environment) => {
    environment.valueForKey = (key) => {
        return environment[keyForBase(key)];
    };
    return environment;
}, dotEnvPath: null});