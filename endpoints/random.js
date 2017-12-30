"use strict";

const {Endpoint} = require("./endpoint.js");
const middleware = require("./middleware.js");
const {ValidationError} = require("./error.js");
const foursquare = require("../foursquare");
const utilities = require("../utilities");
const HTTPStatus = require("http-status-codes");

const random = new Endpoint("random");

function addVenueToCache(venue){
    utilities.cache.set(venue["id"], JSON.stringify(venue));
}

async function downloadDataFor(venues){
    try{
        const result = await foursquare.venueInfo(venues);
        //return result;
        if(Array.isArray(result)){
            result.forEach(addVenueToCache);
        }
        else{
            addVenueToCache(result);
        }
        return result;
    }
    catch(error){
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
    if(!Array.isArray(venues)){
        venues = [venues];
    }
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
    if(!request.needsMoreInfo){ // If we don't need more info, we can choose from this info and send it
        response.send(request.searchResults.randomElement);
        return;
    }

    // Otherwise, we have to go get more info
    request.searchResults.shuffle();
    
    const IDKey = "id";
    while(request.searchResults.length > 0){
        const choice = request.searchResults.shift();
        const cached = JSON.parse(await utilities.cache.get(choice[IDKey]));
        let dataIsFresh = false;
        if(cached){
            dataIsFresh = await utilities.cache.wasSetRecently(choice[IDKey], (new Date().getTime() / 1000) % 60); // Data is fresh if it was set during the current minute
        }
        let full = cached;

        if((request.openNow && !dataIsFresh) || !cached){ // We're gonna eventually download some new data, so we want this to get updated
            request.searchResults.unshift(choice);
        }

        if(request.openNow && !dataIsFresh){ // We have to get new data because the venue must be open and our cache data is stale
            full = await downloadDataFor(request.searchResults.splice(0, foursquare.venueInfo.maximumVenues));
        }
        else if(!cached){ // We're downloading new data because this venue hasn't been cached yet
            await downloadDataFor(await findCacheMisses(request.searchResults));
            continue;
        }

        full = chooseRestaurantFrom(full, request);
        if(full){
            response.send(full);
            return;
        }
    }

    // If we made it here, nothing was found :(
    response.status(HTTPStatus.NOT_FOUND).send({error: "Nothing matching that search could be found"});
};

function floatingPointConvertible(value){
    const result = parseFloat(value);
    return isNaN(result) ? new ValidationError("should be convertible to a floating-point number") : result;
}

random.use(middleware.requireParameters({latitude: floatingPointConvertible, longitude: floatingPointConvertible, radius: floatingPointConvertible}));

// Parameter parsing
random.use((request, response, next) => {
    const geographicalRoundingDecimalPlaces = 4;
    request.latitude = request.latitude.toFixed(geographicalRoundingDecimalPlaces);
    request.longitude = request.longitude.toFixed(geographicalRoundingDecimalPlaces);
    request.categories = request.query.categories ? request.query.categories.split(",") : ["4d4b7105d754a06374d81259"];
    for(let index = 0; index < request.categories.length; index++){
        request.categories[index] = request.categories[index].trim();
    }
    request.categories = request.categories.join(",");
    request.openNow = utilities.parseBool(request.query.openNow);
    request.search = request.query.search;
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

// Searching

random.use(async (request, response, next) => {
    // This is a serialization of a search request into a redis key in the format "latitude:longitude:radius:categories:searchquery?"
    let key = `${request.latitude}:${request.longitude}:${request.radius}:${request.categories}`;
    if(request.search){
        key += `:${request.search}`;
    }

    const cached = await utilities.cache.get(key);
    if(cached){
        request.searchResults = JSON.parse(cached);
    }
    else{ // We gotta hit the network because the search isn't cached
        const parameters = {latitude: request.latitude, longitude: request.longitude, radius: request.radius, intent: "browse", categoryId: request.categories, limit: 50};
        if(request.search){
            parameters.query = request.search;
        }

        const results = await foursquare.search(parameters);
        request.searchResults = results.response.venues;
        utilities.cache.set(key, JSON.stringify(request.searchResults));
    }

    next();
});

module.exports = random;