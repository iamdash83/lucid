//the Application class is a representation of an application.
//it stores references to the 'vm' instance the app is running
//in, and contains information like metadata and such.

var Promise = require("node-promise/promise").Promise;
var fs = require("fs");
var path = require("path");

var Container = require("./Container");

var MANIFEST_FILE = "package.json";
var MANIFEST_CONTAINER_PROPERTY = "lucid-containers";

var STATE_STOPPED = 0
var STATE_LOADING = 1;
var STATE_LOADED = 2;

var Application = module.exports = function(/*String*/packageName, path, sandboxOptions, componentManager, environment){
    this.isLoaded = false;
    this.isLoading = false;
    this._packageName = packageName;
    this._path = path;
    this._sandboxOptions = sandboxOptions;
    this._componentManager = componentManager;
    this._environment = environment;
    this._manifest = null;
    this._containers = {};
    this._containerStates = {};
};

Application.prototype._readManifest = function(cb){
    //this just reads the manifest file and parses it into this._manifest
    var manifestPath = path.join(this._path, this._packageName, MANIFEST_FILE);
    var self = this;
    fs.readFile(manifestPath, function(err, data){
        if(err)
            throw new Error("Error reading manifest for `"+self._packageName+"`: "+err);
        try{
            self._manifest = JSON.parse(data);
        }catch(e){
            throw new Error("Error parsing manifest for `"+self._packageName+"`: "+e);
        }
        cb();
    });
}

Application.prototype._startContainers = function(promise){

    //iterate through each container in the manifest
    var containers = this._manifest[MANIFEST_CONTAINER_PROPERTY];


    var containerStates = this._containerStates;
    for(var containerName in containers){

        //construct the container
        var container = this._containers[containerName] = new Container({
            appName: this._packageName,
            containerName: containerName,
            sandboxDefaults: this._sandboxOptions,
            manifest: containers[containerName],
            path: path.join(this._path, this._packageName),
            componentManager: this._componentManager
        });
        
        //set the state for this container to LOADING
        containerStates[containerName] = STATE_LOADING;
        var self = this;
        container.once("ready", function(){
            //once it's ready, set its state to loaded, and if all containers
            //are loaded emit a success on the promise
            containerStates[containerName] = STATE_LOADED;
            self._checkContainerState(STATE_LOADED, function(){
                promise.emitSuccess();
            });
        });
        
        //emit error on `promise` if starting fails
        try{
            container.start();
        }catch(e){
            promise.emitError(e);
        }
    }
}

Application.prototype._stopContainers = function(promise){
    if(this.isLoading) throw new Error("Tried to stop containers while application was loading!");
    else if(!this.isLoaded) throw new Error("Tried to stop containers, but containers already stopped!");


}

Application.prototype._checkContainerState = function(state, cb){
    var isInState = true;
    for(var i in this._containerStates){
        if(this._containerStates[i] != state){
            isInState = false;
            break;
        }
    }
    //if all containers are in the specified state, call the callback
    if(isInState)
        cb();
}

Application.prototype.load = function(){
    if(this.isLoading || this.isLoaded) throw new Error("Tried to start containers while containers already started!");
    var promise = new Promise();
    this.isLoading = true;

    var self = this;
    this._readManifest(function(){
        //start each container, then set isLoading=false and isLoaded = true
        self._startContainers(promise);
        promise.then(function(){
            self.isLoading = false;
            self.isLoaded = true;
        }, function(){
            self.isLoading = false;
            self.isLoaded = false;
            //TODO: unload containers
        });
    });

    return promise;
}

Application.prototype.unload = function(){
    //this.isLoaded = false;
    //TODO
}
