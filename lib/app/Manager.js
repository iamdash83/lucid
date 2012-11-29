//manages applications during runtime.
//basically this will bootstrap apps on the server end
//and watch over apps' resource usage and such.
//It can also kill applications.

var _ = require("underscore/underscore");
var path = require("path");
var fs = require("fs");
var moduleSelector = require("../moduleSelector");
var Application = require("./Application");

var default_options = {
    path: "packages/",
    whitelist: ["*"],
    blacklist: [],
    sandbox: {
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
        call_timeout: -1
    }
}

var AppManager = module.exports = function(options, componentManager, environment){
    this._environment = environment;
    this._applications = {};
    this._componentManager = componentManager;
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
    var app;

    if(this._applications[appName]){
        app = this._applications[appName];
    }else{
        app = new Application(appName, this._options.path, this._options.sandbox, this._componentManager, this._environment);
    }

    if(app.isLoading || app.isLoaded)
        throw new Error("Application `"+appName+"` already loaded!");
    return app.load();
}

AppManager.prototype.isAppLoaded = function(appName){
    var app = this._applications[appName];
    return !!app && (app.isLoaded || app.isLoading);
}

AppManager.prototype.unloadApp = function(appName){
    return this._applications[appName].unload();
}
