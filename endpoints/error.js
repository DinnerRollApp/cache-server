"use strict";

module.exports.RequestError = class extends Error{
    constructor(message, HTTPStatus=400){
        super(message);
        this.status = HTTPStatus;
    }
};

module.exports.ValidationError = class extends Error{
    constructor(expectation){
        super(`This value was invalid. It should ${expectation}, but was not. Furthermore, an error was encountered in displaying this error, as you should not be seeing this message`);
        this.expectation = expectation;
    }
};