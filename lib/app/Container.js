var Sandbox = require("node-sandbox").Sandbox;

var AppContainer = module.exports = function(componentManager, packageName, containerName, sandboxOptions, options){
    //the file that we run using the sandbox
    this._file = options.file;
    //the name of the package this container is a member of
    this._packageName = packageName;
    //the name of the container specified in the manifest
    this._containerName = containerName;
    //a reference to the component manager
    this._componentManager = componentManager;
    //the options for each API
    this._apiOptions = {};
    //a dict of classes that we expose to the container via RPC
    this._apis = {};
    //holds all the options relating to events
    this._eventOptions = {}:
    //holds all the handles from events registered with the componentManager
    this._eventHandles = [];


    //construct the sandbox

    //TODO: mix in some params from app manifest eventually
    this._sandbox = new Sandbox(this._file, sandboxOptions);

    //TODO: after logging class is done set up logging during the "stderr" event on this._sandbox
    
    var self = this;
    this._sandbox.on("ready", function(){
        self._exposeApis(options);
        self._setupEvents(options);
    });
}

AppContainer.prototype.start = function(){
    this._sandbox.run();
}

AppContainer.prototype.stop = function(){
    this._teardownEvents();
    this._sandbox.kill();
    //reset APIs dict so we can reconstruct it
    this._apis = {};
}

AppContainer.prototype._exposeApis = function(options){
    //creates an object referencing all the exposed APIs that we're granting RPC access too
    //and also keeps track of args to pass to each call with our origin information
    this._apiOptions = options.permissions;
    for(var i in options){
        //TODO: how will the apiOptions be passed to each API? some sort of wrapper maybe?
        this._apis[i] = this._componentManager.getApi(i);
    }

    this._sandbox.rpc.expose("api", this._apis);
}

AppContainer.prototype._setupEvents = function(options){
    //sets up event hooks through ComponentManager so that we get
    //event broadcasts from any components we're subscribed to
    this._eventOptions = options.events;
    for(var i in this._eventOptions){
        var h = this._componentManager.addMessageHandler(i, this._getEventHandler(i), packageName, this._eventOptions[i]);
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
