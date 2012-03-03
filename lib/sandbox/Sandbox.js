var fs = require( 'fs' )
  , path = require( 'path' )
  , child_process = require( 'child_process' )
  , _ = require('underscore/underscore');

var default_options = {
    shovel: path.join(__dirname, "shovel.js"),
    node_command: "node",
    kill_timeout: 10000,
    check_interval: 10000
}

var Sandbox = module.exports = function(/*String*/path, /*Object?*/options){
    this._path = path;
    this._options = _.defaults(options, default_options);
    this._process = null;
    this._checkerInterval = null; //holds setInterval for activity checking
    this._isRunning = false;
};

Sandbox.prototype.run = function(){
    var process = this._process = child_process.spawn(this._options.node_command, [this._options.shovel]);
    
    process.on("exit", this._onExit);

    this._setupChecker();

    this._isRunning = true;
}

Sandbox.prototype._setupChecker = function(){
    this._checkerInterval = setInterval(_.bind(this._procChecker, this), this._options.check_interval);
}

Sandbox.prototype._stopChecker = function(){
    clearInterval(this._checkerInterval);
}

Sandbox.prototype._procChecker = function(){
    //TODO:
}

Sandbox.prototype._onExit = function(code, signal){
    this._stopChecker();
    this._isRunning = false;
    this._process = null;
}

Sandbox.prototype.kill = function(){
    this._stopChecker();
    if(!this._isRunning)
        throw Error("Tried to kill Sandbox while not running!"); //TODO: sub in with actual exception
    
    this._process.kill();
 
    //if we pass a timeout, kill it with fire (SIGKILL)
    var self = this;
    setTimeout(function(){
        if(self._isRunning)
            this.process.kill('SIGKILL');
    }, this._options.kill_timeout);
}
