"use strict";

Function.prototype.bind = (function(original){
    return function(){
        const final = original.apply(this, arguments);
        final.__prebind = final.__prebind || this;
        return final;
    }
})(Function.prototype.bind);

// Methods that return a modified value should be adjectives, not verbs
Function.prototype.boundTo = Function.prototype.bind;

Function.prototype.reboundTo = function(context){
    return this.unbound().boundTo(context);
};

Function.prototype.unbound = function(){
    return this.__prebind || this;
};

Function.isFunction = (test) => {
    return typeof test == "function";
};