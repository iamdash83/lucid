//manages applications during runtime.
//basically this will bootstrap apps on the server end
//and watch over apps' resource usage and such.
//It can also kill applications.

var _ = require("underscore/underscore");
var path = require("path");
var fs = require("fs");
var moduleSelector = require("../moduleSelector");

var default_options = {
    path: "packages/",
    whitelist: ["*"],
    blacklist: []
}

var AppManager = module.exports = function(options, environment){
    this._environment = environment;
    this._options = _.defaults(options || {}, default_options);
    
    //fix the path so that if it's relative, that it's relative to the root given in the environment var
    this._options.path = path.resolve(environment.rootPath, this._options.path);

    //load each application
    var self = this;
    this.getList(function(list){
        list.forEach(function(app){
            self.loadApp(app);
        });
    });
}

AppManager.prototype.getList = function(cb){
    var whitelist = this._options.whitelist;
    var blacklist = this._options.blacklist;
    moduleSelector.getCandidates(this._options.path, "application", function(list){
        cb(moduleSelector.applyFiltering(list, whitelist, blacklist));
    });
}

AppManager.prototype.loadApp = function(appName){
    //TODO: construct the Application obj and add it to the registry
    //also check to make sure it wasn't already loaded
}
