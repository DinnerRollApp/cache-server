"use strict";

const config = require("./foursquare-config.js");
const utilities = require("../utilities");
const {URL} = require("url");

module.exports.constructRequest = (path, params, basePath = "venues") => {
    const endpoint = new URL(path, `https://api.foursquare.com/v2/${basePath}/`);
    params = params instanceof Object ? params : {};
    params.v = config.FOURSQUARE_VERSION;
    params.m = config.FOURSQUARE_MODE;
    params.client_id = utilities.environment.valueForKey("foursquare_client_id");
    params.client_secret = utilities.environment.valueForKey("foursquare_client_secret");
    for(const key in params){
        if(Array.isArray(params[key])){
            let str = "";
            for(const object in params[key]){
                str += params[key] + ",";
            }
            params[key] = str.slice(0, -1);
        }
        //console.info(`Appending ${params[key]} to ${key}`);
        endpoint.searchParams.append(key, params[key]);
    }
    return endpoint;
};