

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
        var h = this._router.add(new RegExp("^/"), this._wrapHandler(handler));
        handles.push(h);
        if(this._rootMounted){
            //TODO: warn about mounting multiple endpoints to root
        }
        this._rootMounted = true;
    }
    
    var h = this._router.add(new RegExp("^"+source+"/"), handler);
    handles.push(h);
    return handles;
}

Dispatcher.prototype._wrapHandler = function(handler){
    return function(request, response, next, path){
        handler(path).then(function(data){
            response.setHeader('Content-Type', "text/html");
            response.write(data);
            response.end();
        }, function(err){
            repsonse.write("500");
            response.end();
        });
    }
}

Dispatcher.prototype.removeHandler = function(handle){
    var self = this;
    handle.forEach(function(h){
        self._router.remove(h);
    });
}
