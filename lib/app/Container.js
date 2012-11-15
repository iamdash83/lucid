var Sandbox = require("node-sandbox").Sandbox;

var AppContainer = module.exports = function(componentManager, packageName, containerName, sandboxOptions, options){
    this._file = options.file;
    this._packageName = packageName;
    this._containerName = containerName;
    this._componentManager = componentManager;
    this._apiOptions = {};
    this._apis = {};
    this._eventHandles = [];

    this._sandbox = new Sandbox(this._file, {
        //TODO: pass in params from config, figure out which perms are needed for require()
    });

    //TODO: set up logging during the "stderr" event on this._sandbox
    
    this._sandbox.on("ready", function(){

    });
}

AppContainer.prototype.start = function(){
    this._sandbox.run();
}

AppContainer.prototype.stop = function(){
    this._teardownEvents();
    this._sandbox.kill();
}

AppContainer.prototype._exposeApis = function(options){
    //creates an object referencing all the exposed APIs that we're granting RPC access too
    //and also keeps track of args to pass to each call with our origin information
    this._apiOptions = options;
    for(var i in options){
        //TODO: how will the apiOptions be passed to each API? some sort of wrapper maybe?
        this._apis[i] = this._componentManager.getApi(i);
    }

    this._sandbox.rpc.expose("api", this._apis);
}

AppContainer.prototype._setupEvents = function(options){
    //sets up event hooks through ComponentManager so that we get
    //event broadcasts from any components we're subscribed to
    for(var i in options){
        var h = this._componentManager.addMessageHandler(i, this._getEventHandler(i), packageName, options[i]);
        this._eventHandles.push(h);
    }
}

AppContainer.prototype._getEventHandler = function(componentName){
    var self = this;
    return function(){
        //TODO: call the relevant endpoint on the sandbox's RPC class
        //also check if we were passed a promise as an argument to see
        //if we need to respond
    }
}

AppContainer.prototype._teardownEvents = function(){
    var self = this;
    this._eventHandles.forEach(function(h){
        self._componentManager.removeMessageHandler(h);
    });
}
