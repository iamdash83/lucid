var _ = require('underscore/underscore')
  , EventEmitter = require('events').EventEmitter
  , sys = require("sys");
  , Promise = require("promise/promise").Promise;

var CommandSender = module.exports = function(/*Stream*/stdout, /*Stream*/stdin){
    EventEmitter.call(this);
    this._stdout = stdout; //the proc's stdout
    this._stdin = stdin; //the proc's stdin
    this._responsePromises = {};
    stdout.setEncoding('utf8');
    stdin.setEncoding('utf8'); //because I'm lazy
    stdout.on('data', _.bind(this._parseResponse, this));
}

CommandSender.prototype.send = function(/*string*/command, /*object*/args){
    var p = new Promise();
    var responseId = this._generateResponseId();

    this._responsePromises[responseId] = p;
    
    var out = JSON.stringify({
        command: command,
        args: args,
        responseId: responseId
    });

    try{
        this._stdin.write(out);
    }catch(e){
        delete this._responsePromises[responseId];
        p.emitError(e);
    }

    return p;
}

CommandSender.prototype._parseResponse = function(/*string*/data){
    var response = JSON.parse(data);
    var p = this._responsePromises[data.responseID];
    if(p){
        if(!response.error){
            p.emitSuccess(data.data);
        }else{
            p.emitError(response.error); //TODO: should this be given as an exception?
        }
        
        delete this._responsePromises[data.responseID];
    }
}

CommandSender.prototype._generateResponseId = function(){
    return (new Date()).getTime();
}

CommandSender.prototype.destroy = function(){
    _.values(this._responsePromises).forEach(function(p){
        p.emitError(new Error("CommandSender destroyed"));
    });
}
