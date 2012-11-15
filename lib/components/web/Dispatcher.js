

var Dispatcher = module.exports = function(){
    //this class is responsible for dispatching events to endpoints (mainly apps). This is different from RPC
    //in the sense that the app manager is responsible for plugging in handlers for certain events
    //on behalf of apps (eg when a web server request is made, or when data in the DB is updated)
    //rather than this class calling functions on RPC directly.
    //This way things are kept loosely coupled and easy to maintain
}

Dispatcher.prototype.addHandler = function(handler, source, filters){
    //Adds a handler to the method dispatcher. `handler` is a function,
    //`source` is a unique identifier that gives info about the endpoint (basically the app's system name)
    //`filters` are arguments specified (for apps, in the manifest) that narrow down the types of messages sent to this endpoint
    
    throw new Error("This function must be implemented in a subclass!");

    return 0; //returns a handle for removal later
}

Dispatcher.prototype.removeHandler = function(handle){
    throw new Error("This function must be implemented in a subclass!");
}

Dispatcher.prototype.emit = function(data){
    //This class emits an event to the endpoints added using `addHandler`
    throw new Error("This function must be implemented in a subclass!");
}
