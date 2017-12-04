"use strict";

const {Endpoint} = require("./endpoint.js");
const middleware = require("./middleware.js");
const {ValidationError} = require("./error.js");
const foursquare = require("../foursquare");
const utilities = require("../utilities");

const random = new Endpoint("random");

random.responders.get = function(request, response){
    foursquare.search({latitude: request.latitude, longitude: request.longitude, radius: request.radius, intent: "browse", categoryId: request.categories.length > 0 ? request.categories.join(",") : "4d4b7105d754a06374d81259"}, (searchError, searchResponse, searchBody) => {
        let allChoices = JSON.parse(searchBody).response.venues;
        if(request.needsMoreInfo){ // We need to get more information about every venue before we can choose
            allChoices.shuffle();
            function nextGroup(){
                if(allChoices.isEmpty){
                    response.status(404).send({error: "Nothing matching that search could be found"});
                }
                else{
                    // Foursquare's multi endpoint can only do 5 at a time
                    foursquare.venueInfo(allChoices.splice(0, 5), (venueError, venueResponse, venueBody) => {
                        for(const venue of venueBody){
                            let price;
                            let openNow;
                            try{
                                price = venue["price"]["tier"];
                            }
                            catch(error){
                                price = undefined;
                            }
                            try{
                                openNow = venue["hours"]["isOpen"];
                            }
                            catch(error){
                                openNow = false;
                            }
                            if(request.needsPriceInfo && !request.price.has(price)){
                                continue;
                            }
                            if(request.openNow && !openNow){
                                continue;
                            }
                            response.send(venue);
                            return;
                        }
                        nextGroup();
                    });
                }
            }
            nextGroup();
        }
        else{ // We have all the info we need, and can choose from this
            response.send(allChoices.randomElement);
        }
    });
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