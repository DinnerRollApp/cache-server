"use strict";

const {Endpoint} = require("./endpoint.js");
const foursquare = require("../foursquare");
const utilities = require("../utilities");
const defaultMiddleware = require("./middleware.js");

const categoriesKey = "categories"

function categoriesCacheKeyForResponse(response) {
    let key = categoriesKey;

    if(response.language){
        key += `:${response.language}`;
    }

    return key;
}

function format(data, response){
    const categories = data[categoriesKey];
    let all = [];
    if(Array.isArray(categories)){
        for(const category of categories){
            if(category.icon){
                category.icon = category.icon.prefix + category.icon.suffix;
            }
            all = all.concat(format(category));
            delete category[categoriesKey];
            all.push(category);
        }
    }
    return all;
};

module.exports = new Endpoint("categories");

const responseType = "application/json";

module.exports.middleware.push(defaultMiddleware.requireLocalization);

module.exports.middleware.push(async (request, response, next) => {
    const cached = await utilities.cache.get(categoriesCacheKeyForResponse(response));
    if(cached){
        // Send the cached version
        response.type(responseType).header("Content-Language", response.language).send(cached);
    }
    else{
        // Cache miss
        next();
    }
});

module.exports.responders.get = async function(request, response){
    const rawData = await foursquare.categories(response.language); // The below syntax gets weird at runtime with an inline await
    const result = JSON.stringify(format(rawData["response"][categoriesKey].filter((category) => {
        return category.id === "4d4b7105d754a06374d81259" || category.name.toUpperCase() === "FOOD";
    })[0]), response);
    utilities.cache.set(categoriesCacheKeyForResponse(response), result);
    response.type(responseType).header("Content-Language", response.language).send(result);
};