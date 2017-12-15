"use strict";

module.exports.function = require("./function.js");
module.exports.environment = require("./environment.js");
module.exports.array = require("./array.js");
module.exports.cache = require("./cache.js");

module.exports.parseBool = (value) => {
    switch(typeof value){
        case "boolean":
            return value; // Just hand back the value if it's already a boolean
        case "number":
            return !!value; // If it's a number, boolean inversion convertis it to a boolean, but we need to do it twice to make sure the boolean value is correct
        case "undefined":
            return false; // False if the value is undefined
        case "string":
            value = value.trim().toLowerCase();
            const num = parseFloat(value);
            if(value === "true" || num){
                return true; // True if it can be converted to a falsey value
            }
            else if(value === "false" || !num){
                return false; // False if it can be converted to a falsey value
            }
            else if(value.length === 0){
                return false; // False for an empty string
            }
            break;
    }
    if(value === null){
        return false; // Null is falsey, but it isn't caught by a typeof block, so we need to explicitly check for it
    }
    return NaN; // NaN is a resonable default error value, as it is unique enough to signal an error, but is falsey
};