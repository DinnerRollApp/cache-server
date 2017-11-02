"use strict";

const filesystem = require("fs");
const {URL} = require("url");
const {Endpoint} = require("./endpoint.js");

module.exports = new Endpoint("categories");

module.exports.responders.get = function(request, response){
    const locator = new URL("caches/categories.json", `file://${__dirname}`);
    if(filesystem.existsSync(locator)){
        response.sendFile(locator.pathname);
    }
    else{
        response.send({error: "No cache found"});
    }
};