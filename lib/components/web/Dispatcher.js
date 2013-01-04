

var Dispatcher = module.exports = function(router){
    this._router = router;
    this._rootMounted = false;
}

Dispatcher.prototype.addHandler = function(handler, source, filters){
    //validate source info for security reasons
    if(!source.match(/^[a-zA-Z0-9_\-]*$/))
        throw new Error("App name `"+source+"` isn't in a format usable for a URL!");


    var handles = [];
    //used for system-level apps like login manager
    if(filters.isRoot){
        var h = this._router.add(new RegExp("^/(.*)$"), this._wrapHandler(source, handler));
        handles.push(h);
        if(this._rootMounted){
            console.log("Warning: Multiple apps mounted to root!");
        }
        this._rootMounted = true;
    }
    
    var h = this._router.add(new RegExp("^"+source+"/"), handler);
    handles.push(h);
    return handles;
}

Dispatcher.prototype._wrapHandler = function(source, handler){
    return function(request, response, next, path){
        handler(path).then(function(data){
            response.setHeader('Content-Type', "text/html");
            response.end(data);
        }, function(err){
            response.statusCode = 500;
            response.write("<h1>HTTP 500 Error</h1>");
            response.write("<p>Error in app `"+source+"`:</p>");
            response.end("<pre>"+err.stack+"</pre>");
        });
    }
}

Dispatcher.prototype.removeHandler = function(handle){
    var self = this;
    handle.forEach(function(h){
        self._router.remove(h);
    });
}
