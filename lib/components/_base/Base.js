var EventEmitter = require("events").EventEmitter;
var util = require("util");

var Base = module.exports = function(componentManager, options, environment){
    EventEmitter.call(this);
    this.dispatcher = null;
    this._environment = environment;
    this._options = options;
    this._componentManager = componentManager;
}

util.inherits(Base, EventEmitter);
