var vm = require("vm");
var fs = require("fs");

var Promise = require("promise/promise").Promise;

var sandbox = module.exports = {
    loadScript: function(/*String*/path, /*Object?*/sandbox){
        var promise = new Promise();

        fs.readFile(this.path, function (err, data){
            if(err){
                promise.emitError(err);
            }else{
                var wasError = false;
                try{
                    //TODO: should we call this directly, or let
                    //our callee call it in the promise object?
                    sandbox = this._setupVm(data, path, sandbox);
                }catch(e){
                    wasError = true;
                    promise.emitError(e);
                }
                if(!wasError){
                    promise.emitSuccess(sandbox);
                }
            }
        });

        return promise;
    },

    setupVm: function(/*String*/code, /*String*/path, /*Object?*/sandbox){
        if(!sandbox) sandbox = {};

        var script = createScript(code, path);

        //TODO: can we do anything to make sure the VM doesn't lock up? Or maybe it runs separatley?
        script.runInNewContext(sandbox);

        return sandbox;
    },

    wrapRequire: function(/*Array?*/allowedModules, /*Array?*/bannedModules){
        //TODO: this will wrap the require() method so that we can stick it in a sandbox and
        //control what a given context of code can require()
    }
}
