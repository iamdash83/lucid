var EventEmitter = require('events').EventEmitter;
var Promise = require("node-promise/promise").Promise;
var util = require("util");
var moduleSelector = require("../moduleSelector");
var uuid = require("node-uuid/uuid");
var _ = require("underscore");

//Monitors object states (started/stopped). We tell
//the Monitor ahead of time if we are manually stopping/starting
//an object, but if it's state changes without being
//told ahead of time, we report it via an event.
var Monitor = module.exports = function(moduleList, timeout, initialState){
    EventEmitter.call(this);

    if(!moduleList) moduleList = [];

    var statuses = this._statuses = {};

    this._initialState = initialState || Monitor.STATE_STOPPED;

    moduleList.forEach(function(mod){
        statuses[mod] = initialState || Monitor.STATE_STOPPED;
    });

    this._triggers = {};
    this._watchEndPromises = [];

    this._modList = moduleList;
    this._triggers[Monitor.STATE_STARTED] = {};
    this._triggers[Monitor.STATE_STOPPED] = {};
    this._timeout = timeout;
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
    var changed = this._statuses[id] != status;

    if(changed){
        this._statuses[id] = status;
        this._handleTriggers(id, status);
    }

    //do cleanup if this module is missing from the modList and it's stopped
    if(this._modList.indexOf(id) == -1 && status == Monitor.STATE_STOPPED){
        //need to delay the delete until after all watches are done,
        //otherwise certain watches will inappropriately call the errback on
        //the promise
        var self = this;
        this.finishWatch().then(function(){
            delete self._statuses[id];
        });
    }

    return changed;
}

//checks to see what event we should trigger.
//If this module is being monitored by a watchInit or watchStop
//call, we trigger that, otherwise we trigger a default
//on("stop") or on("start") event
Monitor.prototype._handleTriggers = function(id, newstatus){
    var trigs = this._popTrigger(id, newstatus);
    
    if(trigs.length == 0){
        this.emit(Monitor.EVENT_NAMES[newstatus], id);
    }else{
        trigs.forEach(function(trigger){
            trigger()
        });
    }

}

//called to get the triggers for when module `id`
//changes to state `status`. Deletes the triggers
//before returning the result.
Monitor.prototype._popTrigger = function(id, status){
    var ret = this._triggers[status][id];
    delete this._triggers[status][id];
    return _.values(ret || {});
}

//adds a trigger for when module `id` changes state to `status`.
//`Monitor` will automatically call `callback` when this happens.
Monitor.prototype._addTrigger = function(id, status, callback){
    if(!this._triggers[status][id])
        this._triggers[status][id] = {};
    var cursor = uuid.v4();
    this._triggers[status][id][cursor] = callback;
    return {s: status, i: id, c: cursor};
}


//removes a trigger off the tree given a cursor returned
//from `_addTrigger`
Monitor.prototype._removeTrigger = function(c){
    if(this._triggers[c.s][c.i]){
        delete this._triggers[c.s][c.i][c.c];
        if(_.isEmpty(this._triggers[c.s][c.i]))
            delete this._triggers[c.s][c.i];
    }
}

Monitor.prototype.expandRegex = function(ids){
    return moduleSelector.applyFiltering(this._modList, ids);
}

Monitor.prototype._watch = function(ids, status){
    var p = new Promise();

    //expand the regex list to a full list of ids
    ids = this.expandRegex(ids);

    //check if we're already doing a watch on one of the affected modules
    if(this.isWatched(ids, true)){
        throw new Error("Already doing a watch on one or more of the specified modules!");
    }
    
    
    //change checking code
    var changed = {};

    //cursors from _addTrigger calls
    var triggerCursors = [];

    var self = this;
    ids.forEach(function(id){
        changed[id] = false;

        //check to make sure if a module is already in the target state.
        //if it is, then mark it as already changed
        if(self._statuses[id] == status){
            changed[id] = true;
        }

        var cursor = self._addTrigger(id, status, function(){

            changed[id] = true;

            //check if all changed
            var allChanged = true;
            ids.forEach(function(id){
                if(!changed[id])
                    allChanged = false;
            });

            //if we all changed, we need to call a callback on the promise.
            //If everything is in the target state, we call the callback
            //otherwise call the errback.
            if(allChanged){

                //verify that all modules are in the target state
                if(self.allInState(ids, status, true))
                    p.callback();
                else
                    p.errback(new Error("Couldn't get all modules to the target state!"));
            }
        });

        triggerCursors.push(cursor);
    });


    //set it so the promise will time out after the specified timeout interval
    if(this._timeout){
        p.timeout(this._timeout);
    }

    //if the promise is resolved, remove the triggers
    //also, notify Monitor that a watch was just completed
    p.addBoth(function(){
        triggerCursors.forEach(function(cursor){
            self._removeTrigger(cursor);
        })

        self._onWatchEnd();
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

//checks the status of each module to see if it's equal to `status`.
//if any of the IDs specified aren't equal to status, returns false,
//otherwise returns true
//if `isExpanded` is true, we don't apply regex expansion to it
Monitor.prototype.allInState = function(ids, status, isExpanded){

    if(!isExpanded)
        ids = this.expandRegex(ids);

    var inState = true;
    var self = this;
    ids.forEach(function(id){
        if(self._statuses[id] != status){
            inState = false;
        }
    })
    return inState;
}

//checks the status of each module to see if any are equal to `status`.
//if any of the IDs specified are equal to status, returns true,
//otherwise returns false
//if `isExpanded` is true, we don't apply regex expansion to it
Monitor.prototype.anyInState = function(ids, status, isExpanded){

    if(!isExpanded)
        ids = this.expandRegex(ids);

    var self = this;
    for(var k in ids){
        var id = ids[k];
        if(self._statuses[id] == status){
            return true;
        }
    }
}

//tells you if there's a watch in progress for any of the module
//ids given in `ids`. If there are, returns true.
//if `isExpanded` is true, we don't apply regex expansion to it
Monitor.prototype.isWatched = function(ids, isExpanded){
    if(!isExpanded)
        ids = this.expandRegex(ids);


    var t = this._triggers;
    var watched = false;

    ids.forEach(function(id){
        if(t[Monitor.STATE_STOPPED][id] || t[Monitor.STATE_STARTED][id])
            watched = true;
    });

    return watched;
}

//called when a watch finishes. Here we resolve any promises created by
//the `finishWatching` function.
Monitor.prototype._onWatchEnd = function(){
    if(!this.isWatched(this._modList, true)){
        var p;
        while(p = this._watchEndPromises.pop()){
            p.emitSuccess();
        }
    }
}

//returns a promise that's resolved right after
//any watchStart/watchStop calls placed are finished
//and we're in a target state
Monitor.prototype.finishWatch = function(){
    var p = new Promise();
    this._watchEndPromises.push(p);
    return p;
}

//if the module list ever changes, external code can
//call this function to update it in the Monitor class
Monitor.prototype.setList = function(list){
    this._modList = list;

    //create initial statuses for the modules that were added
    var statuses = this._statuses;
    var initialState = this._initialState;

    list.forEach(function(mod){
        if(!statuses[mod])
            statuses[mod] = initialState;
    });

    //any statuses that need to be removed will be removed by
    //calls to `Monitor.report()` after said modules reach STATE_STOPPED
}
