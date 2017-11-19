"use strict";

const express = require("express");
const filesystem = require("fs");
const dinnerRoll = require("./endpoints");

const app = express();

dinnerRoll.listen(app);
app.use(require("./endpoints/middleware.js").sendError);
app.listen(process.env.PORT || 3000);