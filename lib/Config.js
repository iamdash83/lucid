var Promise = require("node-promise/promise").Promise;
var fs = require("fs");

var Config = module.exports = function(/*String*/path){
    //  summary:
    //      Loads a json file from the path given and
    //      puts it's contents in RAM for fast reading
    //  path:
    //      The path to the config to read
    this.isLoaded = false;
    this.path = path;
    this.config = null;
}


Config.prototype.load = function(){
    //  summary:
    //      Loads the json file asynchronously. Returns
    //      a Promise object.
    var promise = new Promise();

    if(this.isLoaded){
        promise.emitSuccess(this.config);
        return promise;
    }
    
    var self = this;
    fs.readFile(this.path, function (err, data){
        if(err){
            promise.emitError(err);
        }else{
            var wasError = false;
            try{
                self._parseJsonToConfig(data);
            }catch(e){
                wasError = true;
                promise.emitError(e);
            }
            if(!wasError){
                promise.emitSuccess(self.config);
            }
        }
    });

    return promise;
}

Config.prototype.loadSync = function(){
    //  summary:
    //      Loads the json file synchronously. Returns
    //      the contents.
    if(this.isLoaded)
        return this.config;
    var content = fs.readFileSync(this.path);
    return this._parseJsonToConfig(content);
}

Config.prototype._parseJsonToConfig = function(/*String*/content){
    this.config = JSON.parse(content)
    this.isLoaded = true;
    return this.config;
}

Config.prototype.get = function(/*String*/key){
    //  summary:
    //      Grabs the given key from the configuration file.
    //  key:
    //      The key to grab. Can traverse objects by using '.'
    //      for example:
    //      > "database.user" //to get to
    //      > {database: {user: "foo"}}

    if(!this.isLoaded){
        throw new Error("Config not loaded yet!");
    }

    if(key.indexOf(".") != -1){
        var keys = key.split(".");
        var cursor = this.config;
        for(var i in keys){
            cursor = cursor[keys[i]];
        }
        return cursor;
    }else{
        return this.config[key];
    }
}
