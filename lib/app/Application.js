var Monitor = require("./Monitor");
var Container = require("./Container");
var Promise = require("node-promise/promise").Promise;
var fs = require("fs");
var path = require("path");
var _ = require("underscore");

var defaultOptions = {
    name: "",
    path: "",
    sandboxDefaults: {},
    componentManager: null
}

var MANIFEST_FILE = "package.json";
var MANIFEST_CONTAINER_PROPERTY = "lucid-containers";

var Application = module.exports = function(options){

    //grab private var values from options
    this._name = options.name;
    this._sandboxDefaults = options.sandboxDefaults;
    this._componentManager = options.componentManager;
    this._path = options.path;

    //misc private vars
    //TODO, set timeout on Monitor class?
    this._monitor = new Monitor();
    this._containers = {};

    //set up monitor logging events
    var self = this;
    this._monitor.on("stop", function(name){
        console.log(options.name+": container `"+name+"` stopped unexpectedly! Stopping all containers...");
        self.stop();
    })
    this._monitor.on("start", function(name){
        console.log(options.name+": container `"+name+"` started unexpectedly!");
    })
}

Application.prototype.isStarted = function(){
    return this._monitor.anyInState(["*"], Monitor.STATE_STARTED) || this._monitor.isWatched(["*"]);
}

Application.prototype.isStopped = function(){
    return this._monitor.allInState(["*"], Monitor.STATE_STOPPED);
}


Application.prototype.start = function(){
    //before anything, if we're already started throw an error
    if(this.isStarted()){
        throw new Error("Tried to start containers while containers already started!");
    }


    var p = new Promise();
    var self = this;

    //read manifest
    this._readManifest().then(function(manifest){
        
        //get container data
        var containers = manifest[MANIFEST_CONTAINER_PROPERTY];
        var list = _.keys(containers);

        //pass container list to Monitor
        self._monitor.setList(list);

        //now start a watch on the containers
        //this will fulful the promise for us when everything starts
        self._monitor.watchStart(list).then(function(){
            p.emitSuccess(list);
        }, function(err){
            p.emitError(err);
        });

        //start each container
        list.forEach(function(contName){
            var container = self._containers[contName] = new Container({
                appName: self._name,
                containerName: contName,
                sandboxDefaults: self._sandboxDefaults,
                manifest: containers[contName],
                path: self._path,
                componentManager: self._componentManager
            });

            //set up events for Monitor
            container.on("stop", function(){
                self._monitor.report(contName, Monitor.STATE_STOPPED);
            });

            container.start().then(function(){
                self._monitor.report(contName, Monitor.STATE_STARTED);
            }, function(error){
                //TODO: come up with a way to tell Monitor when starting something failed
                self._monitor.report(contName, Monitor.STATE_STARTED);
                self._monitor.report(contName, Monitor.STATE_STOPPED);
                console.log(error);
            });
        });


    }, function(err){
        p.errback(err);
    });

    return p;
}

Application.prototype.stop = function(){
    var p = new Promise();
    var self = this;

    //first wait for any watches to finish, so we know we're not
    //stopping things while a start is going on
    this._monitor.finishWatch().then(function(){
        //set up a watch on all containers so we know when we're done
        self._monitor.watchStop(["*"]).then(function(){
            console.log("Stopped all containers for "+self._name);
            p.emitSuccess();
        }, function(err){
            console.log(err);
        });

        self._monitor.getInState(Monitor.STATE_STARTED).forEach(function(cont){
            self._containers[cont].stop();
        });
    });

    return p;
}

//this just reads the manifest file
Application.prototype._readManifest = function(cb){
    var p = new Promise();
    var manifestPath = path.join(this._path, MANIFEST_FILE);
    var self = this;
    fs.readFile(manifestPath, function(err, data){
        if(err){
            p.errback(new Error("Error reading manifest for `"+self._name+"`: "+err));
        }else{
            try{
                p.callback(JSON.parse(data));
            }catch(e){
                p.errback(new Error("Error parsing manifest for `"+self._name+"`: "+e));
            }
        }
    });
    return p;
}
