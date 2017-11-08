"use strict";

module.exports.RequestError = class extends Error{
    constructor(message, HTTPStatus){
        super(message);
        this.status = HTTPStatus;
    }
}