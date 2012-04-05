var _ = require('underscore/underscore')
  , EventEmitter = require('events').EventEmitter
  , sys = require("sys")
  , Promise = require("promise/promise").Promise;

//In an ideal world, this would use buffers and some sort of json parser that
//accepts from buffers. But I'm lazy and need to get this done.

var CommandHandler = module.exports = function(/*Stream*/stdout, /*Stream*/stdin){
    EventEmitter.call(this);
    this._stdout = stdout; //our stdout (readable)
    this._stdin = stdin; //our stdin (writable)
    this.isReady = false;
    stdout.setEncoding('utf8');
    stdin.setEncoding('utf8'); //because I'm lazy
    stdin.on('data', _.bind(this._parseCommand, this));

}

sys.inherits(CommandHandler, EventEmitter);

CommandHandler.prototype.ready = function(){
    this.isReady = true;
    //Tell the CommandSender we're ready for input
    this._stdout.write(JSON.stringify({ready: true})+"\n");
};

CommandHandler.prototype._parseCommand = function(/*string*/data){

    data.split("\n").forEach(_.bind(function(item){
        if(item == "") return;
        var packet = JSON.parse(item);

        //if we're just getting pinged, send a blank response.
        if(packet.ping){
            this.sendPong();
            return;
        }

        var promise = new Promise();
        promise.then(
            _.bind(function(result){
                this.sendResponse(packet.responseId, result);
            }, this),
            _.bind(function(error){
                this.sendErrorResponse(packet.responseId, error);
            }, this)
        );
        
        try{
            this.emit(packet.command, packet.args, promise);
        }catch(e){
            //this.sendErrorResponse(data.responseId, e);
            promise.errback(e);
        }
    }, this));

}

CommandHandler.prototype.sendPong = function(responseId, data){
    var response = JSON.stringify({pong: true});
    this._stdout.write(response+"\n");
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
