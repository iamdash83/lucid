var _ = require('underscore/underscore')
  , EventEmitter = require('events').EventEmitter
  , sys = require("sys");

var CommandHandler = module.exports = function(/*Stream*/stdout, /*Stream*/stdin){
    EventEmitter.call(this);
    this._stdout = stdout; //our stdout (readable)
    this._stdin = stdin; //our stdin (writable)
    stdout.setEncoding('utf8');
    stdin.setEncoding('utf8'); //because I'm lazy
    stdin.on('data', _.bind(this._parseCommand, this));

    //Tell the CommandSender we're ready for input
    stdout.write(JSON.stringify({ready: true})+"\n");
}

sys.inherits(CommandHandler, EventEmitter);

CommandHandler.prototype._parseCommand = function(/*string*/data){

    data.split("\n").forEach(_.bind(function(item){
        if(item == "") return;
        var packet = JSON.parse(item);
        
        //this.emit.call(null, ["command", data.command].concat(data.args));
        try{
            this.emit(packet.command, packet.args, packet.responseId);
            //TODO: put promises here so that the dev doesn't have to worry about responseIds, just callbacks
        }catch(e){
            this.sendErrorResponse(data.responseId, e);
        }
    }, this));
}

CommandHandler.prototype.sendResponse = function(responseId, data){
    var response = JSON.stringify({responseId: responseId, data: data});
    this._stdout.write(response+"\n");
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
    this._stdout.write(response+"\n");
}
