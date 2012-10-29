var _ = require("underscore/underscore");
var EventEmitter = require('events').EventEmitter;
var util = require("util");
var ComponentLoader = require("./ComponentLoader");

var option_defaults = {
    path: __dirname+"../components",
    whitelist: ["*"],
    blacklist: []
};

var ComponentManager = module.exports = function(options){
    EventEmitter.call(this);

    this._options = _.defaults(option_defaults, options);
    this._loadedComponents = {};

    //ignore any components starting with a '_'
    this._options.blacklist.splice(0, 0, "_*");

    var loader = this._loader = new ComponentLoader(this._options);
    var self = this;
    loader.getComponentList(function(list){
        var components = loader.loadComponents(list);
        self.emit("ready");
    });
}

util.inherits(ComponentManager, EventEmitter);


