"use strict";

const express = require("express");
const dinnerRoll = require("./endpoints");

const app = express();

dinnerRoll.listen(app);
app.use(dinnerRoll.middleware.sendError);
app.listen(process.env.PORT || 3000);