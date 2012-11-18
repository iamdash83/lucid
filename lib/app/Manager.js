//manages applications during runtime.
//basically this will bootstrap apps on the server end
//and watch over apps' resource usage and such.
//It can also kill applications.

var _ = require("underscore/underscore");
var path = require("path");
var fs = require("fs");

var default_options = {
    path: "packages/"
}

var AppManager = module.exports = function(options, environment){
    this._environment = environment;
    this._options = _.defaults(options || {}, default_options);
    
    //fix the path so that if it's relative, that it's relative to the root given in the environment var
    this._options.path = path.resolve(environment.rootPath, this._options.path);

    //TODO: construct each Application instance
}

AppManager.prototype.listApplications = function(){
    
}
