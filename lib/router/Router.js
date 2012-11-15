var Promise = require("node-promise/promise").Promise;


var Router = module.exports = function(){
    //  summary:
    //      A basic router that routes URLs based on a given RegExp.
    //      Note that you'll get better performance by splitting
    //      your routes up in several different routers in a 
    //      tree-like fashon, otherwise we have to iterate through
    //      a huge list of RegExp objects to match.
    this.routes = [];
}

Router.prototype.route = function(/*String*/path){
    //  summary:
    //      Maps a given path to a function. If we can't find a function
    //      for the given path, we call errback.
    //  path:
    //      The path (URL/URI) that we should be mapping to a function
    //  returns:
    //      A new Promise instance. We pass the resolved route to it,
    //      but if we couldn't find a route we call the error method.
    var promise = new Promise();
    var isMatched = false;

    //do routey stuff then emit success/error
    for(var i in this.routes){
        var route = this.routes[i];
        var match = route.pattern.exec(path);
        if(match){
            isMatched = true;
            if(route.route instanceof Router){
                //pass the route off to the subrouter
                //TODO: will using a simple replace() create errors for patterns that don't use ^?
                path = path.replace(match[0], "");
                //should probably pick better names to avoid things like route.route.route()
                var self = this;
                route.route.route(path).then(function(result){
                    match.splice(0, 1);
                    promise.emitSuccess(
                        self._wrapRoute(result, match)
                    );
                }, function(error){
                    promise.emitError(error);
                });
            }else{
                match.splice(0, 1);
                promise.emitSuccess(
                    this._wrapRoute(route.route, match)
                );
            }
            break; //we shouldn't match more than once
        }
    }

    if(!isMatched){
        promise.emitError(new Error("No route found for \"%s\"".replace("%s", path)));
    }

    return promise; //Promise
}

Router.prototype.add = function(/*RegExp*/pattern, /*Router|function*/route){
    //  summary:
    //      Adds a route to our list of routes to match against.
    //  pattern:
    //      The pattern to match against.
    //  route:
    //      If it's a Router, we'll drop the part that was matched in `pattern`
    //      and pass the remaining path to the `route` function on the router.
    //      If it's a function, we'll pass this back to be called by whatever
    //      code is trying to route the path.
    //  returns:
    //      An id that can be used to remove the route
    this.routes.push({
        pattern: pattern,
        route: route
    });
    return this.routes.length-1; //Number
}

Router.prototype._wrapRoute = function(/*Function*/route, /*Array*/matches){
    //  summary:
    //      Wraps a route so that any arguments that get passed to the
    //      returned function get the matches appended to the end of the
    //      arguments we pass.
    //  route:
    //      The route function to wrap
    //  matches:
    //      The relevant matches from the URL that we're appending to
    //      the arguments list

    return function(){
        var newArgs = [];
        //if arguments was an array this would be simple, but alas.
        var numArgs = arguments.length;
        var numMatches = matches.length;
        for(var i=0;i<numArgs;i++){
            newArgs[i] = arguments[i];
        }
        for(var i=numArgs;i<numMatches+numArgs;i++){
            newArgs[i] = matches[i-numArgs];
        }

        return route.apply(null, newArgs);
    }
}

Router.prototype.remove = function(/*Number*/id){
    //  summary:
    //      Removes a given route.
    //  id:
    //      The id from `add`
    this.routes.splice(id, 1);
}
