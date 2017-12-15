"use strict";

const environment = require("./environment.js");

let config = {password: environment.valueForKey("redis_password")};
const socketPath = environment.valueForKey("redis_socket");
if(socketPath){
    config["path"] = socketPath;
}
const redis = require("redis").createClient(config);

module.exports.get = (key, callback) => {
    redis.get(key, callback);
}

module.exports.set = (key, value, timeout) => {
    redis.set(key, value, "EX", typeof timeout === "number" ? timeout : 604800); // We want to expire all keys after they live for a week, unless otherwise specified
}