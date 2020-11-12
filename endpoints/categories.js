"use strict";

const {Endpoint} = require("./endpoint.js");
const tree = require("un-flatten-tree");
const utilities = require("../utilities");
const yelp = require("yelp-fusion").client(utilities.environment.valueForKey("yelp_bearer_token"));
const defaultMiddleware = require("./middleware.js");

const categoriesKey = "categories"

function categoriesCacheKeyForResponse(response){
    let key = categoriesKey;

    if(response.language){
        key += `:${response.language}`;
    }

    return key;
}

function headerForLanguage(language){
    // Foursquare allows caching data up to 24 hours
    return {"Cache-Control": "public, max-age=86400", "Content-Language": language};
}

module.exports = new Endpoint("categories");

const responseType = "application/json";

module.exports.middleware.push(defaultMiddleware.requireLocalization);

module.exports.middleware.push(async (request, response, next) => {
    const cached = await utilities.cache.get(categoriesCacheKeyForResponse(response));
    if(cached){
        // Send the cached version
        response.type(responseType).header(headerForLanguage(response.language)).send(cached);
    }
    else{
        // Cache miss
        next();
    }
});

module.exports.responders.get = async function(request, response){
    const rawData = (await yelp.allCategories({locale: response.language}))["jsonBody"]["categories"];
    // Yelp's data comes in as a weird flat tree that we need to construct to properly find all children of the "restaurants" or "food" categories
    let dataTree = tree.unflatten(rawData, (category, parent) => category.parent_aliases.includes(parent.alias), (category, parent) => parent.children.push(category), (category) => {
        if (!category.children) {
            category.children = [];
        }
        return category;
    }).filter((category) => module.exports.responders.get.isTopLevelEatery(category)); // Once it's constructed, we want to remove anything that isn't a food category
    
    const result = tree.flatten(dataTree, (category) => category.children, (category) => {
        return {alias: category.alias, name: category.title}; // All we need to send the frontend is the alias and the name
    }).filter((category) => !module.exports.responders.get.isTopLevelEatery(category)); // Once we have the data we want, we don't need to send the 2 highest-level food categories that all the others inherit from
    utilities.cache.set(categoriesCacheKeyForResponse(response), JSON.stringify(result));
    response.type(responseType).header(headerForLanguage(response.language)).send(result);
};

module.exports.responders.get.isTopLevelEatery = function(category){
    return category.alias === "restaurants" || category.alias === "food";
}