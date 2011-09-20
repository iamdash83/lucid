var Router = exports = function(){
    this.routes = [];
}

Router.prototype.route = function(/*String*/path, /*Function*/callback){
    //  summary:
    //      Maps a given path to a function. If we can't find a function
    //      for the given path, we call errback.
    //  path:
    //      The path (URL/URI) that we should be mapping to a function
    //  callback:
    //      A callback to call when we find a route
    //      TODO: I think we need something like dojo.Deferred here instead
}

Router.prototype.add = function(/*RegExp*/pattern, /*Router|function*/next){
    //  summary:
    //      Adds a route to our list of routes to match against.
    //  pattern:
    //      The pattern to match against.
    //  next:
    //      If it's a Router, we'll drop the part that was matched in `pattern`
    //      and pass the remaining path to the `route` function on the router.
    //      If it's a function, we'll pass this back to be called by whatever
    //      code is trying to route the path.
}

Router.prototype.remove = function(){
    //  summary:
    //      Removes a given route. No idea how this is going to work yet.
}
