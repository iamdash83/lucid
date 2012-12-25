var EventEmitter = require('events').EventEmitter;
var Promise = require("node-promise/promise").Promise;

//Monitors object states (started/stopped). We tell
//the Monitor ahead of time if we are manually stopping/starting
//an object, but if it's state changes without being
//told ahead of time, we report it via an event.
var Monitor = module.exports = function(){
    EventEmitter.call(this);
    this._statuses = {};
    this._triggerTree = {};
    this._triggerTree[Monitor.STATE_STARTED] = {};
    this._triggerTree[Monitor.STATE_STOPPED] = {};
}

Monitor.STATE_STARTED = 1;
Monitor.STATE_STOPPED = 2;
    
util.inherits(Monitor, EventEmitter);

//reports the status of an object to the Monitor
//returns true if changed, false if the same
Monitor.prototype.report = function(id, status){
    if(this._statuses[id] != status){
        
        this._handleTriggers(id, this._statuses[id], status);

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
Monitor.prototype._handleTriggers = function(id, oldstatus, newstatus){
    
}

//called to get the triggers for when module `id`
//changes to state `status`. Deletes the triggers
//before returning the result.
Monitor.prototype._popTrigger = function(id, status){

}

//adds a trigger for when module `id` changes state to `status`.
//`Monitor` will automatically call `callback` when this happens.
Monitor.prototype._addTrigger = function(id, status, callback){

}

//waits for the modules specified to start, and
//notifies when all have started.
Monitor.prototype.watchInit = function(modules){
    
}

//waits for the modules specified to stop, and
//notifies when all have stopped
Monitor.prototype.watchStop = function(modules){
    
}
