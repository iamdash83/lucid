var fs = require( 'fs' )
  , EventEmitter = require('events').EventEmitter
  , sys = require("sys")
  , path = require( 'path' )
  , child_process = require( 'child_process' )
  , _ = require('underscore/underscore')
  , CommandSender = require("./CommandSender");

var default_options = {
    shovel: path.join(__dirname, "shovel.js"),
    node_command: "node",
    kill_timeout: 10000,
    check_interval: 10000
}

//TODO: have an on("error") event for when shit hits the fan
//TODO: we might have a problem if the sandboxed code defines it's command handling events
//in an async function. We may have to figure out how to signal a second ready state
//in this case, but the code for that would be annoying, so leaving it as-is for now.

var Sandbox = module.exports = function(/*String*/path, /*Object?*/options){
    if(!options) options = {};
    this._path = path;
    this._options = _.defaults(options, default_options);
    this._process = null;
    this._checkerInterval = null; //holds setInterval for activity checking
    this._isRunning = false;
    this.command = null;
};

sys.inherits(Sandbox, EventEmitter);

Sandbox.prototype.run = function(){
    var cprocess = this._process = child_process.spawn(this._options.node_command, [this._options.shovel]);
    
    cprocess.on("exit", _.bind(this._onExit, this));

    var command = this.command = new CommandSender(cprocess.stdout, cprocess.stdin);

    this._setupChecker();

    command.once("ready", _.bind(function(){
        command.send("init", {
            path: this._path,
            permissions: [] //TODO
        }).then(_.bind(function(){
            this.emit("ready");
        }, this));

    }, this));

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
    this.emit("exit");
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
