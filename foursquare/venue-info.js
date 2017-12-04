"use strict";

const request = require("request");
const {constructRequest} = require("./request-builder.js");

module.exports = (venues, callback) => {
    if(typeof venues === "string"){ // Only one venue was passed, so we can just call the API directly
        request(constructRequest(venues).href, callback);
    }
    else if(Array.isArray(venues)){ // Otherwise, we can batch requests with the multi endpoint
        let chain = "";
        for(const venue of venues){
            chain += `/venues/${venue instanceof Object ? venue.id : venue},`
        }
        request(constructRequest("", {requests: chain.slice(0, -1)}, "multi").href, (error, response, body) => {
            let results = [];
            for(const venue of JSON.parse(body)["response"]["responses"]){
                results.push(venue["response"]["venue"]);
            }
            callback(error, response, results);
        });
    }
};