var EventEmitter = require('events').EventEmitter;
var Promise = require("node-promise/promise").Promise;
var util = require("util");
var moduleSelector = require("../moduleSelector");

//Monitors object states (started/stopped). We tell
//the Monitor ahead of time if we are manually stopping/starting
//an object, but if it's state changes without being
//told ahead of time, we report it via an event.
var Monitor = module.exports = function(moduleList){
    EventEmitter.call(this);
    var statuses = this._statuses = {};

    moduleList.forEach(function(mod){
        statuses[mod] = Monitor.STATE_STOPPED;
    });

    this._triggers = {};
    this._modList = moduleList;
    this._triggers[Monitor.STATE_STARTED] = {};
    this._triggers[Monitor.STATE_STOPPED] = {};
}

Monitor.STATE_STARTED = 1;
Monitor.STATE_STOPPED = 2;
Monitor.EVENT_NAMES = {
    1: "start",
    2: "stop"
};
    
util.inherits(Monitor, EventEmitter);

//reports the status of an object to the Monitor
//returns true if changed, false if the same
Monitor.prototype.report = function(id, status){
    if(this._statuses[id] != status){
        
        this._handleTriggers(id, status);

        this._statuses[id] = status;
        return true;
    }else{
        return false;
    }
}

//checks to see what event we should trigger.
//If this module is being monitored by a watchInit or watchStop
//call, we trigger that, otherwise we trigger a default
//on("stop") or on("start") event
Monitor.prototype._handleTriggers = function(id, newstatus){
    var trigs = this._popTrigger(id, newstatus);
    if(trigs.length == 0){
        //no triggers, so emit an event
        this.emit(Monitor.EVENT_NAMES[newstatus], id);
    }else{
        trigs.forEach(function(trigger){
            trigger();
        });
    }
}

//called to get the triggers for when module `id`
//changes to state `status`. Deletes the triggers
//before returning the result.
Monitor.prototype._popTrigger = function(id, status){
    var ret = this._triggers[status][id];
    delete this._triggers[status][id];
    return ret || [];
}

//adds a trigger for when module `id` changes state to `status`.
//`Monitor` will automatically call `callback` when this happens.
Monitor.prototype._addTrigger = function(id, status, callback){
    if(!this._triggers[status][id])
        this._triggers[status][id] = [];
    this._triggers[status][id].push(callback);
}

Monitor.prototype._watch = function(ids, status){
    var p = new Promise();

    //expand the regex list to a full list of ids
    ids = moduleSelector.applyFiltering(this._modList, ids);
    
    var changed = {};

    var self = this;
    ids.forEach(function(id){
        changed[id] = false;

        self._addTrigger(id, status, function(){
            changed[id] = true;

            //check if all changed
            var allChanged = true;
            ids.forEach(function(id){
                if(!changed[id])
                    allChanged = false;
            });

            //if we all changed, call the callback
            if(allChanged)
                p.callback();
        });
    });

    return p;
}

//waits for the modules specified to start, and
//notifies when all have started.
Monitor.prototype.watchStart = function(modules){
    return this._watch(modules, Monitor.STATE_STARTED);
}

//waits for the modules specified to stop, and
//notifies when all have stopped
Monitor.prototype.watchStop = function(modules){
    return this._watch(modules, Monitor.STATE_STOPPED);
}
