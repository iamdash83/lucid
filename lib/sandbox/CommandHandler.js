var _ = require('underscore/underscore')
  , EventEmitter = require('events').EventEmitter
  , sys = require("sys");


var CommandHandler = module.exports = function(/*Stream*/stdout, /*Stream*/stdin){
    EventEmitter.call(this);
    this._stdout = stdout; //our stdout
    this._stdin = stdin; //our stdin
    stdout.setEncoding('utf8');
    stdin.setEncoding('utf8'); //because I'm lazy
    stdin.on('data', _.bind(this._parseCommand, this));
}

sys.inherits(CommandHandler, EventEmitter);

CommandHandler.prototype._parseCommand = function(/*string*/data){
    var packet = JSON.parse(data);
    
    //this.emit.call(null, ["command", data.command].concat(data.args));
    try{
        this.emit(data.command, data.args, data.responseId);
    }catch(e){
        this.sendErrorResponse(data.responseId, e);
    }
}

CommandHandler.prototype.sendResponse = function(responseId, data){
    var response = JSON.stringify({responseId: responseId, data: data});
    this._stdout.write(response);
}

CommandHandler.prototype.sendErrorResponse = function(responseId, error){
    var response = JSON.stringify({
        responseId: responseId,
        error: {
            "stack": error.stack,
            "message": error.message,
            "name": error.name,
            "type": error.type,
            "arguments": error["arguments"]
        }
    });
    this._stdout.write(response);
}
