var Sandbox = require("node-sandbox").Sandbox;

var AppContainer = module.exports = function(options){
    this._file = options.file;
    
}

AppContainer.prototype._exposeApis = function(options){
    //creates an object referencing all the exposed APIs that we're granting RPC access too
    //and also keeps track of args to pass to each call with our origin information
}

AppContainer.prototype._setupEvents = function(options){
    //sets up event hooks through ComponentManager so that we get
    //event broadcasts from any components we're subscribed to
}
