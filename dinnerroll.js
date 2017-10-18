module.exports = {respondWithPlaceholder, random};

function respondWithPlaceholder(request, response){
    response.send({path: request.path});
}

function random(request, response){
    respondWithPlaceholder(request, response);
}