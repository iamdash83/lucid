var Base = require("../_base/Base");
var WebDispatcher = require("./Dispatcher");
var util = require("util");

var Router = require("../../router/Router");
var connect = require("connect");
var routerMiddleware = require("../../router/middleware");

var Web = module.exports = function(){
    Base.apply(this, arguments);

    this._setupServer(this._options.port);

    this._setupRouter(function(router){
        this.dispatcher = new WebDispatcher(router);
    });
    
    //TODO
    this._componentManager.exposeApi("web", {});
    this.dispatcher = {addHandler: function(){}, removeHandler: function(){}}
}

util.inherits(Web, Base);

Web.prototype._setupServer = function(port){
    var middleware = this._getMiddleware();

    //TODO: honor the useHttps config setting
    //see http://nodejs.org/docs/v0.3.7/api/https.html#https.createServer
    var server = this.server = connect.createServer();
    for(var i in middleware){
        server.use.apply(server, middleware[i]);
    }
    server.listen(port);
    //TODO: better way of logging
    require("sys").puts("Listening on port :"+port);
}

Web.prototype._getMiddleware = function(){
    //TODO: clear this stuff out
    return [
        [connect.favicon()],
        [connect.logger()],
        ["/static", connect.static(this._environment.rootPath + '/public')]
    ]
}

Web.prototype._setupRouter = function(callback){
    var self = this;
    this.server.use(routerMiddleware(function(router){
        self.router = router;


        //begin test routes

        //NOTE: calling next() is basically a 404 error

        router.add(new RegExp("^/foo/[a-zA-Z0-9]*/$"), function(req, res, next, path){
            res.setHeader('Content-Type', "text/html");
            res.write("It seems that the router worked!");
            res.end();
        });

        router.add(new RegExp("^/$"), function(req, res, next, path){
            res.setHeader('Content-Type', "text/html");
            res.write("I am kawaii uguu <a href='/static'>Some static content</a> ");
            res.write("or <a href='/foo/bar"+Math.round(Math.random()*10)+"/'>test the router</a>");
            res.end();
        });

        //end routes
        
        callback(router);
    }));
}

