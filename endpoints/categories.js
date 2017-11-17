"use strict";

const filesystem = require("fs");
const {URL} = require("url");
const {Endpoint} = require("./endpoint.js");
const foursquare = require("../foursquare");

const categoriesKey = "categories";

const flatten = (data) => {
    const categories = data[categoriesKey];
    let all = [];
    if(Array.isArray(categories)){
        for(const category of categories){
            all = all.concat(flatten(category));
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
        response.send(flatten(JSON.parse(body)["response"][categoriesKey].filter((category) => {
            return category.id === "4d4b7105d754a06374d81259" || category.name.toUpperCase() === "FOOD";
        })[0]));
    });
};