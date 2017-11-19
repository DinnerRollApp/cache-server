"use strict";

Object.defineProperty(Array.prototype, "randomIndex", {configurable: false, enumerable: false, get: function(){
    return Math.floor(Math.random() * this.length);
}});

Object.defineProperty(Array.prototype, "randomElement", {configurable: false, enumerable: false, get: function(){
    return this[this.randomIndex];
}});