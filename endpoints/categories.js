"use strict";

const filesystem = require("fs");
const {URL} = require("url");
const {Endpoint} = require("./endpoint.js");
const foursquare = require("../foursquare");

const categoriesKey = "categories";

const format = (data) => {
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

module.exports.responders.get = function(request, response){
    foursquare.categories((error, foursquareResponse, body) => {
        // This appears complicated, but it gets all subcategories to the "Food" category, transforms the data to make all category objects siblings in an array instead of nodes in a nested object tree, and sends it
        response.send(format(JSON.parse(body)["response"][categoriesKey].filter((category) => {
            return category.id === "4d4b7105d754a06374d81259" || category.name.toUpperCase() === "FOOD";
        })[0]));
    });
};