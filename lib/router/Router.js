var Promise = require("promise/promise").Promise;


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
        if(route.pattern.test(path)){
            isMatched = true;
            if(route.route instanceof Router){
                //pass the route off to the subrouter
                path = path.replace(route.pattern, "");
                //should probably pick better names to avoid things like route.route.route()
                route.route.route(path).then(function(result){
                    promise.emitSuccess(result);
                }, function(error){
                    promise.emitError(error);
                });
            }else{
                promise.emitSuccess(route.route);
            }
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

Router.prototype.remove = function(/*Number*/id){
    //  summary:
    //      Removes a given route.
    //  id:
    //      The id from `add`
    this.routes.splice(id, 1);
}
