var path = require("path");
var moduleSelector = require("../moduleSelector");
var Monitor = require("./Monitor");
var Application = require("./Application");
var Promise = require("node-promise/promise").Promise;
var _ = require("underscore");

var default_options = {
    path: "packages/",
    whitelist: ["*"],
    blacklist: [],
    sandbox: null
}

var Manager = module.exports = function(options, rootPath, componentManager){
    //set up private vars from args
    this._componentManager = componentManager;
    this._options = _.defaults(options || {}, default_options);
    
    //fix the path so that if it's relative, that it's relative to the root given in the environment var
    this._options.path = path.resolve(rootPath, this._options.path);


    //internal private vars
    this._applications = {};
    this._monitor = new Monitor();
    
    //set up monitor events
    this._monitor.on("stop", function(name){
        console.log("App Manager: app `"+name+"` stopped unexpectedly!");
    })
    this._monitor.on("start", function(name){
        console.log("App Manager: app `"+name+"` started unexpectedly!");
    })
}

Manager.prototype.start = function(apps){
    if(!apps) apps = ["*"];

    var p = new Promise();
    var self = this;

    //get app listing
    this.getList(function(list){
        //wait for any watches to finish, so we know we're not
        //starting things while a stop is going on
        self._monitor.finishWatch().then(function(){
            //update Monitor's internal list
            //and garbage collect any apps that don't exist anymore
            self._monitor.setList(list);
            self._garbageCollectApps(list);

            //now narrow it down to the apps we want to start
            var startList = moduleSelector.applyFiltering(list, apps);

            self._monitor.watchStart(startList).then(function(){
                console.log("Started following apps successfully: "+startList.join(", "));
            }, function(error){
                console.log(error);
            });

            //start the specified apps
            startList.forEach(function(item){
                if(!self._applications[item]){
                    self._constructApp(item);
                }
                
                self._applications[item].start().then(function(){
                    self._monitor.report(item, Monitor.STATE_STARTED);
                }, function(error){
                    //TODO: come up with a way to tell Monitor when starting something failed
                    self._monitor.report(item, Monitor.STATE_STARTED);
                    self._monitor.report(item, Monitor.STATE_STOPPED);
                    console.log(error);
                });
            });
        });
    });

    return p;
}

Manager.prototype._garbageCollectApps = function(currentList){
    //TODO: warn when an app wasn't stopped when garbage collecting
    
}

Manager.prototype.stop = function(apps){
    var p = new Promise();
    var self = this;
    
    //first wait for any watches to finish, so we know we're not
    //starting things while a stop is going on
    this._monitor.finishWatch().then(function(){
        //expand the list of apps from regex
        //we're using `self._applications` here because `start()` is meant for loading
        //apps from disk, whereas here we're stopping apps in memory
        var stopList = moduleSelector.applyFiltering(_.keys(self._applications), apps);

        //set up a watch on all affected so we know when we're done
        self._monitor.watchStop(stopList).then(function(){
            console.log("Stopped apps: "+stopList.join(", "));
            p.emitSuccess();
        }, function(err){
            console.log(err);
        });

        stopList.forEach(function(name){
            self._applications[name].stop().then(function(){
                self._monitor.report(name, Monitor.STATE_STOPPED);
            }, function(err){
                //TODO: come up with a way to tell Monitor when stopping something failed
                self._monitor.report(name, Monitor.STATE_STOPPED);
                self._monitor.report(name, Monitor.STATE_STARTED);
                console.log(err);
            });
        });
    });

    return p;
}

Manager.prototype._constructApp = function(name){
    var app = new Application({
        name: name,
        path: path.join(this._options.path, name),
        sandboxDefaults: this._options.sandbox,
        componentManager: this._componentManager
    });
    
    //hook up events
    var self = this;
    app.on("stop", function(){
        self._monitor.report(name, Monitor.STATE_STOPPED);
    });

    app.on("start", function(){
        self._monitor.report(name, Monitor.STATE_STARTED);
    });
    
    //add it to the applications object
    this._applications[name] = app;
}

Manager.prototype.getList = function(cb){
    var whitelist = this._options.whitelist;
    var blacklist = this._options.blacklist;
    moduleSelector.getCandidates(this._options.path, "application", function(list){
        cb(moduleSelector.applyFiltering(list, whitelist, blacklist));
    });
}
