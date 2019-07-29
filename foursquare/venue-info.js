"use strict";

const request = require("request-promise-native");
const {constructRequest} = require("./request-builder.js");

module.exports = async (venues, language) => {
    if(typeof venues === "string"){ // Only one venue was passed, so we can just call the API directly
        return await request(constructRequest(venues));
    }
    else if(Array.isArray(venues)){ // Otherwise, we can batch requests with the multi endpoint
        let chain = "";
        for(const venue of venues){
            chain += `/venues/${venue instanceof Object ? venue.id : venue},`
        }
        const response = await request(constructRequest("", {requests: chain.slice(0, -1)}, language ? {"Accept-Language": language} : null, "multi"));
        let results = [];
        for(const venue of response["response"]["responses"]){
            results.push(venue["response"]["venue"]);
        }
        return results;
    }
};

// A request to /multi can have a maximum of 5 requests batched
Object.defineProperty(module.exports, "maximumVenues", {configurable: false, enumerable: true, value: 5, writable: false});