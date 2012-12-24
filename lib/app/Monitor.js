var EventEmitter = require('events').EventEmitter;
var Promise = require("node-promise/promise").Promise;

//Monitors object states (started/stopped). We tell
//the Monitor ahead of time if we are manually stopping/starting
//an object, but if it's state changes without being
//told ahead of time, we report it via an event.
var Monitor = module.exports = function(){
    EventEmitter.call(this);
    this._statuses = {};
}

Monitor.STATE_STARTED = 1;
Monitor.STATE_STOPPED = 2;
    
util.inherits(Monitor, EventEmitter);

//reports the status of an object to the Monitor
//returns true if changed, false if the same
Monitor.prototype.report = function(id, status){
    if(this._statuses[id] != status){
        
        //TODO: check if we should trigger an event

        this._statuses[id] = status;
        return true;
    }else{
        return false;
    }
}

//waits for the modules specified to start, and
//notifies when all have started.
Monitor.prototype.watchInit = function(modules){
    
}

//waits for the modules specified to stop, and
//notifies when all have stopped
Monitor.prototype.watchStop = function(modules){
    
}
