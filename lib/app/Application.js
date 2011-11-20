//the Application class is a representation of an application.
//it stores references to the 'vm' instance the app is running
//in, and contains information like metadata and such.

var vm = require("vm");
var fs = require("fs");
var sandbox = require("../sandbox");
var Promise = require("promise/promise").Promise;

var URL_FILE = "urls.js";
var HOOKS_FILE = "hooks.js";
var MANIFEST_FILE = "package.json";

var Application = module.exports = function(/*String*/path){
    this.isLoaded = false;
    this._manifest = null;
    this._urlRouter = null;
    this._hookManager = null;
    this._filePath = path;
    this._urlContext = null;
    this._hookContext = null;
};

Application.prototype.readManifest = function(){
    //TODO
    //this just reads the manifest file and parses it
    //into this._manifest
}

Application.prototype.load = function(){
    var promise = new Promise();

    //TODO: check for errors (eg no hooks file)
    //also maybe have something unwritable to the app that will stop
    //apps from loading hooks if they're not supposed to have them

    //TODO: create separate contexts for these

    var urlPath = this._filePath + URL_FILE;
    var hookPath = this._filePath + HOOKS_FILE;

    var urlContext = this._urlContext = sandbox.loadScript(urlPath);
    var hookContext = this._hookContext = sandbox.loadScript(hookPath);

    return promise;
}

Application.prototype.unload = function(){

}
