//the Application class is a representation of an application.
//it stores references to the 'vm' instance the app is running
//in, and contains information like metadata and such.

var sandbox = require("../sandbox");
var Promise = require("promise/promise").Promise;

var URL_FILE = "urls.js";
var HOOKS_FILE = "hooks.js";
var MANIFEST_FILE = "package.json";

var Application = module.exports = function(/*String*/packageName, appManager){
    this.isLoaded = false;
    this._packageName = packageName;
    this._manifest = null;
};

Application.prototype._readManifest = function(){
    //TODO
    //this just reads the manifest file and parses it
    //into this._manifest
}

Application.prototype.load = function(){
    var promise = new Promise();


    return promise;
}

Application.prototype.unload = function(){

}
