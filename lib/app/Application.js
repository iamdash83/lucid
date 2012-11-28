//the Application class is a representation of an application.
//it stores references to the 'vm' instance the app is running
//in, and contains information like metadata and such.

var Promise = require("node-promise/promise").Promise;
var fs = require("fs");
var path = require("path");

var MANIFEST_FILE = "package.json";
var MANIFEST_CONTAINER_PROPERTY = "lucid-containers";

var Application = module.exports = function(/*String*/packageName, path, environment){
    this.isLoaded = false;
    this.isLoading = false;
    this._packageName = packageName;
    this._path = path;
    this._environment = environment;
    this._manifest = null;
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
