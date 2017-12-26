"use strict";

const {Endpoint} = require("./endpoint.js");
const middleware = require("./middleware.js");
const {ValidationError} = require("./error.js");
const foursquare = require("../foursquare");
const utilities = require("../utilities");

const random = new Endpoint("random");

function addToCache(venue){
    utilities.cache.set(venue["id"], JSON.stringify(venue));
}

async function downloadDataFor(venues){
    try{
        const result = await foursquare.venueInfo(venues);
        //return result;
        if(Array.isArray(result)){
            result.forEach(addToCache);
        }
        else{
            addToCache(result);
        }
        return result;
    }
    catch(error){
        console.info(error.message);
        return null;
    }
}

function matchesParameters(restaurant, request){
    if(request.needsPriceInfo){
        try{
            if(!request.price.has(restaurant["price"]["tier"])){
                return false;
            }
        }
        catch(error){
            return false;
        }
    }
    if(request.openNow){
        try{
            if(!restaurant["hours"]["isOpen"]){
                return false;
            }
        }
        catch(error){
            return false;
        }
    }
    return true;
}

function chooseRestaurantFrom(venues, request, shouldShuffle = false){
    const originalLength = venues.length;
    for(let counter = 0; counter < originalLength; ++counter){
        const choice = shouldShuffle ? venues.removeRandomElement() : venues.shift();
        if(matchesParameters(choice, request)){
            return choice;
        }
    }
    return null;
}

async function findCacheMisses(choices, startIndex = 0){
    const misses = [];
    for(let index = startIndex; index < choices.length && misses.length < foursquare.venueInfo.maximumVenues; index++){
        const id = choices[index]["id"];
        const cached = await utilities.cache.get(id);
        if(!cached){
            misses.push(id);
        }
    }
    return misses;
}

random.responders.get = async function(request, response){
    const searchResults = await foursquare.search({latitude: request.latitude, longitude: request.longitude, radius: request.radius, intent: "browse", categoryId: request.categories.length > 0 ? request.categories.join(",") : "4d4b7105d754a06374d81259", limit: 50});

    let allChoices = searchResults.response.venues;

    if(!request.needsMoreInfo){ // If we don't need more info, we can choose from this info and send it
        response.send(allChoices.randomElement);
        return;
    }

    // Otherwise, we have to go get more info
    allChoices.shuffle();

    if(request.openNow){ // We can't hit the cache if the venue must be open
        while(allChoices.length > 0){
            const choice = chooseRestaurantFrom(await downloadDataFor(allChoices.splice(0, foursquare.venueInfo.maximumVenues)), request);
            if(choice){ // We have a match!
                response.send(choice);
                return;
            }
        }
    }
    else{ // If it doesn't matter if the venue is open or not, we can check the cache
        while(allChoices.length > 0){
            const possibility = allChoices.shift();
            const cached = await utilities.cache.get(possibility["id"]);
            if(cached){ // The item was found in the cache
                if(matchesParameters(JSON.parse(cached), request)){
                    response.type("application/json").send(cached);
                    return;
                }
            }
            else{ //Cache miss, so let's download some stuff and start the loop again
                allChoices.unshift(possibility);
                await downloadDataFor(await findCacheMisses(allChoices));
            }
        }
    }
    // If we made it here, nothing was found :(
    response.status(404).send({error: "Nothing matching that search could be found"});
};

function floatingPointConvertible(value){
    const result = parseFloat(value);
    return isNaN(result) ? new ValidationError("should be convertible to a floating-point number") : result;
}

random.use(middleware.requireParameters({latitude: floatingPointConvertible, longitude: floatingPointConvertible, radius: floatingPointConvertible}));
random.use((request, response, next) => {
    request.categories = request.query.categories ? request.query.categories.split(",") : [];
    request.openNow = utilities.parseBool(request.query.openNow);
    request.price = new Set();
    request.query.price = request.query.price || "";
    for(const point of request.query.price.split(",")){
        const num = parseInt(point.trim());
        if(num && num >= 1 && num <= 4){
            request.price.add(num);
        }
    }
    request.needsPriceInfo = request.price.size > 0 && request.price.size < 4; // The lowest possible price is 1, the highest is 4. An empty set or a full set means we don't need price info
    request.needsMoreInfo = request.needsPriceInfo || request.openNow; // We'll need more info either if the venue must be open or if price info is necessary
    next();
});

module.exports = random;