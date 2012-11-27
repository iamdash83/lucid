//the Application class is a representation of an application.
//it stores references to the 'vm' instance the app is running
//in, and contains information like metadata and such.

var Promise = require("node-promise/promise").Promise;

var MANIFEST_FILE = "package.json";
var MANIFEST_CONTAINER_PROPERTY = "lucid-containers";

var Application = module.exports = function(/*String*/packageName, environment){
    this.isLoaded = false;
    this.isLoading = false;
    this._packageName = packageName;
    this._environment = environment;
    this._manifest = null;
};

Application.prototype._readManifest = function(cb){
    //TODO
    //this just reads the manifest file and parses it
    //into this._manifest
}

Application.prototype.load = function(){
    var promise = new Promise();
    this.isLoading = true;

    var self = this;
    this._readManifest(function(){
        //TODO: start each container, then set isLoading=false and isLoaded = true
    });

    return promise;
}

Application.prototype.unload = function(){
    this.isLoaded = false;
    //TODO
}
