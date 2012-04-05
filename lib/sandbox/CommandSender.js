var _ = require('underscore/underscore')
  , EventEmitter = require('events').EventEmitter
  , sys = require("sys")
  , Promise = require("promise/promise").Promise
  , uuid = require("node-uuid/uuid");

//In an ideal world, this would use buffers and some sort of json parser that
//accepts from buffers. But I'm lazy and need to get this done.

var CommandSender = module.exports = function(/*Stream*/stdout, /*Stream*/stdin){
    EventEmitter.call(this);
    this._stdout = stdout; //the proc's stdout
    this._stdin = stdin; //the proc's stdin
    this._responsePromises = {};
    this.isReady = false;
    stdout.setEncoding('utf8');
    stdin.setEncoding('utf8'); //because I'm lazy
    stdout.on('data', _.bind(this._parseResponse, this));
}

sys.inherits(CommandSender, EventEmitter);

CommandSender.prototype.ping = function(/*int*/timeout){
    if(!this.isReady){
        throw new Error("Tried to ping before the CommandHandler was ready for input!");
    }

    //make a new promise and call it when we get a pong
    //callback gets passed the time in ms it took to get a response
    var p = new Promise();
    var start = new Date();
    var called = false;
    p.addBoth(function(){
        called = true;
    });
    this.once("pong", function(){
        var end = new Date();
        var delta = end.getTime() - start.getTime();
        if(!called)
            p.callback(delta);
    });
    
    //send the ping
    var out = JSON.stringify({ping: true});
    this._stdin.write(out);

    //make sure the promise gets errbacks called if
    //it takes too long
    p.timeout(timeout);
    return p;
}

CommandSender.prototype.send = function(/*string*/command, /*object*/args){
    if(!this.isReady){
        throw new Error("Tried to send a command before the CommandHandler was ready for input!");
    }
    var p = new Promise();
    var responseId = this._generateResponseId();

    this._responsePromises[responseId] = p;
    
    var out = JSON.stringify({
        command: command,
        args: args,
        responseId: responseId
    })+"\n";

    try{
        this._stdin.write(out);
    }catch(e){
        delete this._responsePromises[responseId];
        p.emitError(e);
    }

    return p;
}

CommandSender.prototype._parseResponse = function(/*string*/data){
    data.split("\n").forEach(_.bind(function(item){
        if(item == "") return;
        var response = JSON.parse(item);
        if(response.ready){
            //the Handler is telling us that it's ready for commands
            this.isReady = true;
            this.emit("ready");
        }else if(response.pong){
            this.emit("pong");
        }else{
            var p = this._responsePromises[response.responseId];
            if(p){
                if(!response.error){
                    p.emitSuccess(response.data);
                }else{
                    p.emitError(response.error); //TODO: should this be given as an exception?
                }
                
                delete this._responsePromises[response.responseId];
            }
        }
    }, this));
}

CommandSender.prototype._generateResponseId = function(){
    return uuid.v4();
}

CommandSender.prototype.destroy = function(){
    _.values(this._responsePromises).forEach(function(p){
        p.emitError(new Error("CommandSender destroyed"));
    });
}
