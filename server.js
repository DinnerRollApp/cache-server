"use strict";
const express = require("express");
const filesystem = require("fs");
const dinnerRoll = require("./dinnerroll.js");

const app = express();

app.get("/", dinnerRoll.random);
app.get("/random", dinnerRoll.random);

app.get("/categories", (request, response) => {
    dinnerRoll.respondWithPlaceholder(request, response);
});

app.listen(3000, () => {
    console.info("Express is listening");
});