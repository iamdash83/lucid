var Sandbox = require("node-sandbox").Sandbox;

var AppContainer = module.exports = function(componentManager, packageName, containerName, options){
    this._file = options.file;
    this._packageName = packageName;
    this._containerName = containerName;
    this._componentManager = componentManager;
    this._apiOptions = {};
    this._apis = {};
    this._eventHandles = [];
}

AppContainer.prototype._exposeApis = function(options){
    //creates an object referencing all the exposed APIs that we're granting RPC access too
    //and also keeps track of args to pass to each call with our origin information
    this._apiOptions = options;
    for(var i in options){
        //TODO: how will the apiOptions be passed to each API? some sort of wrapper maybe?
        this._apis[i] = this._componentManager.getApi(i);
    }
}

AppContainer.prototype._setupEvents = function(options){
    //sets up event hooks through ComponentManager so that we get
    //event broadcasts from any components we're subscribed to
    for(var i in options){
        var h = this._componentManager.addMessageHandler(i, /*func (TODO)*/, packageName, options[i]);
        this._eventHandles.push(h);
    }
}
