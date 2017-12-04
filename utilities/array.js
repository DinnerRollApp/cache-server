"use strict";

Object.defineProperty(Array.prototype, "randomIndex", {configurable: false, enumerable: false, get: function(){
    return Math.floor(Math.random() * this.length);
}});

Object.defineProperty(Array.prototype, "randomElement", {configurable: false, enumerable: false, get: function(){
    return this[this.randomIndex];
}});

Object.defineProperty(Array.prototype, "isEmpty", {configurable: false, enumerable: true, get: function(){
    return this.length <= 0;
}});

Array.prototype.shuffle = function(){
    for (let current = this.length - 1; current > 0; current--) {
        const random = Math.floor(Math.random() * (current + 1));
        [this[current], this[random]] = [this[random], this[current]];
    }
};