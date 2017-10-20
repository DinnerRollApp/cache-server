"use strict";

const express = require("express");
const filesystem = require("fs");
const dinnerRoll = require("./endpoints");

const app = express();

dinnerRoll.listen(app);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.info(`DinnerRoll Server is listening at http://localhost:${port}`);
});