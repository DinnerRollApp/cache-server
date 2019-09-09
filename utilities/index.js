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
    // Null is falsey, but it isn't caught by a typeof block, so we need to explicitly check for it
    // NaN is a resonable default error value, as it is unique enough to signal an error, but is falsey
    return value === null ? false : NaN;
};
// Pulled from https://www.yelp.com/developers/documentation/v3/supported_locales on September 8, 2019
module.exports.supportedLanguageCodes = ["cs_CZ", "da_DK", "de_AT", "de_CH", "de_DE", "en_AU", "en_BE", "en_CA", "en_CH", "en_GB", "en_HK", "en_IE", "en_MY", "en_NZ", "en_PH", "en_SG", "en_US", "es_AR", "es_CL", "es_ES", "es_MX", "fi_FI", "fil_PH", "fr_BE", "fr_CA", "fr_CH", "fr_FR", "it_CH", "it_IT", "ja_JP", "ms_MY", "nb_NO", "nl_BE", "nl_NL", "pl_PL", "pt_BR", "pt_PT", "sv_FI", "sv_SE", "tr_TR", "zh_HK", "zh_TW"];