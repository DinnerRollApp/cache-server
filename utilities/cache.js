"use strict";

const environment = require("./environment.js");
const utilities = require("../utilities");
const bluebird = require("bluebird");
const redis = require("redis");
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

let config = {password: environment.valueForKey("redis_password")};
const socketPath = environment.valueForKey("redis_socket");
if(socketPath){
    config["path"] = socketPath;
}

const cache = redis.createClient(config);

module.exports.defaultLifetime = 604800;

module.exports.get = cache.getAsync.boundTo(cache);

module.exports.set = (key, value, timeout = module.exports.defaultLifetime) => {
    cache.set(key, value, "EX", timeout); // We want to expire all keys after they live for a week, unless otherwise specified
};

module.exports.cacheLifeRemaining = cache.ttlAsync.boundTo(cache);
module.exports.wasSetRecently = async (key, interval = 60, lifetime = module.exports.defaultLifetime) => {
    try{
        const lifeLeft = await cache.ttlAsync(key);
        console.info(lifetime - lifeLeft);
        return lifetime - lifeLeft < interval;
    }
    catch(error){
        console.log(`Failed to check cache lifetime with error: ${error.message}`);
        return false;
    }
};