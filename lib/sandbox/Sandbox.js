var fs = require( 'fs' )
  , path = require( 'path' )
  , child_process = require( 'child_process' );

var default_options = {
    shovel: path.join(__dirname, "shovel"),
    node_command: "node"
}

var Sandbox = module.exports = function(/*String*/path, /*Object?*/options){
    this._path = path;
    this._options = options || default_options;
    this._process = null;
    this._isRunning = false;
};

Sandbox.prototype.run = function(){
    var process = this._process = child_process.spawn(this._options.node_command, [this._options.shovel]);
    
    process.on("exit", this._onExit);

    //TODO: set a timeout to test responsiveness

    this._isRunning = true;
}

Sandbox.prototype._onExit = function(code, signal){
    this._isRunning = false;
    this._process = null;
}

Sandbox.prototype.kill = function(){
    if(!this._isRunning)
        throw Error("Tried to kill Sandbox while not running!"); //TODO: sub in with actual exception
    
    this._process.kill(); //TODO: if we pass a timeout, kill it with SIGKILL
}
