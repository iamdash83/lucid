var _ = require("underscore/underscore");
var EventEmitter = require('events').EventEmitter;
var util = require("util");
var ComponentLoader = require("./ComponentLoader");

var option_defaults = {
    path: __dirname+"../components",
    whitelist: ["*"],
    blacklist: [],
    arguments: {}
};

var ComponentManager = module.exports = function(options){
    EventEmitter.call(this);

    this._options = _.defaults(option_defaults, options);
    this._loadedComponents = {};
    this._apis = {};

    //ignore any components starting with a '_'
    this._options.blacklist.splice(0, 0, "_*");

    var loader = this._loader = new ComponentLoader(this._options);
    var self = this;
    loader.getComponentList(function(list){
        //note that `components` is sorted in a way such that dependencies will be resolved
        var components = loader.loadComponents(list);
        for(var i in components){
            //construct the component
            self._loadedComponents[i] = new components[i](self, self._options.arguments[i] || {});
        }
        self.emit("ready");
    });
}

util.inherits(ComponentManager, EventEmitter);

ComponentManager.prototype.get = function(name){
    return this._loadedComponents[name];
}

ComponentManager.prototype.exposeApi = function(name, obj){
    this._apis[name] = obj;
}

ComponentManager.prototype.addMessageHandler = function(compName, handler, source, filters){
    if(!this._loadedComponents[compName])
        throw new Error("Problem adding message handler for `"+source+"`: Component `"+compName+"` not loaded! Maybe it was blacklisted/missing from whitelist?");
    else if(!this._loadedComponents[compName].dispatcher)
        throw new Error("Problem adding message handler for `"+source+"`: Component `"+compName+"` doesn't have a message dispatcher exposed!");
    else
        return {
            component: compName,
            handle: this._loadedComponents[compName].dispatcher.addHandler(handler, source, filters);
        }
}

ComponentManager.prototype.removeMessageHandler = function(handle){
    return this._loadedComponents[handle.component].dispatcher.removeHandler(handle.handle);
}
