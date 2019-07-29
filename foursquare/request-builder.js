"use strict";

const config = require("./foursquare-config.js");
const utilities = require("../utilities");
const {URL} = require("url");

module.exports.constructRequest = (path, params, headers, basePath = "venues") => {
    const endpoint = new URL(path, `https://api.foursquare.com/v2/${basePath}/`);
    params = params instanceof Object ? params : {};
    params.v = config.FOURSQUARE_VERSION;
    params.m = config.FOURSQUARE_MODE;
    params.client_id = utilities.environment.valueForKey("foursquare_client_id");
    params.client_secret = utilities.environment.valueForKey("foursquare_client_secret");
    for(const key in params){
        endpoint.searchParams.append(key, normalizeForHTTP(params[key]));
    }

    const request = {uri: endpoint.href, method: "GET", json: true};

    if(headers instanceof Object){
        for(const key in headers) {
            headers[key] = normalizeForHTTP(headers[key]);
        }
        request.headers = headers;
    }
    return request;
};

function normalizeForHTTP(object){
    if(Array.isArray(object)){
        let str = "";
        for(const element of object) {
            str += element + ",";
        }
        return str.slice(0, -1);
    }
    else{
        return object;
    }
}