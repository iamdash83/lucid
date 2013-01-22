var Sandbox = require("node-sandbox").Sandbox;
var EventEmitter = require("events").EventEmitter;
var Promise = require("node-promise/promise").Promise;
var _ = require("underscore");
var path = require("path");

var defaultOptions = {
    appName: "",
    containerName: "",
    manifest: {},
    componentManager: null,
    sandboxDefaults: {}
}

var sandboxDefaultsDefaults = {
    node_command: "node",
    //how long we should wait for a reply
    //before emitting a 'lockup' event.
    lockup_timeout: 10000,
    //how long we should wait after killing the process
    //to kill -9 it.
    kill_with_fire_timeout: 10000,
    //the interval we should use to send pings.
    ping_interval: 10000,
    //how long we should wait before assuming
    //the sandbox failed to start (locked up)
    startup_timeout: 10000,
    //method call timeout (passed to RPC)
    call_timeout: -1,
    //whether the default options should override the app-specified options
    overrideAppOptions: false
}

var AppContainer = module.exports = function(options){
    EventEmitter.call(this);

    //setup defaults
    options = _.defaults(options, defaultOptions);
    options.sandboxDefaults = _.defaults(_.clone(options.sandboxDefaults), sandboxDefaultsDefaults);
    
    
    //the file that we run using the sandbox
    this._file = path.join(options.path, options.manifest.file);
    //the name of the package this container is a member of
    this._appName = options.appName;
    //the name of the container specified in the manifest
    this._containerName = options.containerName;
    //a reference to the component manager
    this._componentManager = options.componentManager;

    //the options for each API
    this._apiOptions = options.manifest.permissions;
    //a dict of classes that we expose to the container via RPC
    this._apis = {};
    //holds all the options relating to events
    this._eventOptions = options.manifest.events;
    //holds all the handles from events registered with the componentManager
    this._eventHandles = [];

    
    var sandboxOptions = options.sandboxDefaults;
    //mixin properties from manifest if appropriate
    if(!options.sandboxDefaults.overrideAppOptions && options.manifest.sandbox){
        [
            "lockup_timeout",
            "kill_with_fire_timeout",
            "ping_interval",
            "startup_timeout",
            "call_timeout"
        ].forEach(function(i){
            sandboxOptions[i] = options.manifest.sandbox[i];
        });
    }
    delete sandboxOptions.overrideAppOptions;


    //construct the sandbox
    this._sandbox = new Sandbox(this._file, sandboxOptions);

    this._sandbox.on("stderr", function(err){
        //TODO: after logging class is done set up logging during the "stderr" event on this._sandbox
        
        if(/\n$/.test(err)){
            err = String(err).replace(/\n$/, "");
        }
        console.log("STDERR for "+options.appName+": "+err);
    });

    //`options` contains options for this container from the app's
    //manifest file
    var self = this;
    this._sandbox.on("ready", function(){
        self.emit("ready");
    });

    this._sandbox.on("exit", function(){
        self._teardownEvents();
        //reset APIs dict so we can reconstruct it
        self._apis = {};
        self.emit("stop");
    });
}

util.inherits(AppContainer, EventEmitter);

AppContainer.prototype.start = function(){
    var p = new Promise();
    var self = this;

    var onReady = function(){
        self._exposeApis();
        self._setupEvents();
        p.emitSuccess();
    };

    this._sandbox.once("ready", onReady);

    try {
        this._sandbox.run();
    }catch(e){
        this._sandbox.removeListener("ready", onReady);
        p.emitError(e);
    }

    return p;
}

AppContainer.prototype.stop = function(){
    this._sandbox.kill();
}

//creates an object referencing all the exposed APIs that we're granting RPC access too
//and also keeps track of args to pass to each call with our origin information
AppContainer.prototype._exposeApis = function(){
    var options = this._apiOptions;
    for(var i in options){
        this._apis[i] = this._componentManager.getApi(i, options[i]);
    }

    this._sandbox.rpc.expose("api", this._apis);
}

AppContainer.prototype._setupEvents = function(){
    //sets up event hooks through ComponentManager so that we get
    //event broadcasts from any components we're subscribed to
    var eventOptions = this._eventOptions;
    for(var i in eventOptions){
        var h = this._componentManager.addMessageHandler(i, this._getEventHandler(i), this._appName, eventOptions[i]);
        this._eventHandles.push(h);
    }
}

AppContainer.prototype._getEventHandler = function(componentName){
    var self = this;
    return function(){
        //TODO: check if we were passed a promise as an argument to see
        //if we need to respond
        return self._sandbox.rpc.call(componentName, arguments);
    }
}

AppContainer.prototype._teardownEvents = function(){
    var self = this;
    this._eventHandles.forEach(function(h){
        self._componentManager.removeMessageHandler(h);
    });
}
