var Config = require("./Config");
var Router = require("./router/Router");
var connect = require("connect");
var routerMiddleware = require("./router/middleware");

var Lucid = module.exports = function(settings){
    this.settings = settings;
    this.config = new Config(settings.config);
    this.router = null;
    this.server = null;

    var self = this;
    this.config.load().then(function(){
        self._setupServer();
        self._bootstrap();
        self._setupRouter();
    }, function(error){
        //TODO: better way of logging
        require("sys").puts("Error reading config file");
    });
}

Lucid.prototype._setupServer = function(){
    var middleware = this._getMiddleware();

    //TODO: honor the useHttps config setting
    //see http://nodejs.org/docs/v0.3.7/api/https.html#https.createServer
    var server = this.server = connect.createServer();
    for(var i in middleware){
        server.use.apply(server, middleware[i]);
    }
    server.listen(this.config.get("port"));
    //TODO: better way of logging
    require("sys").puts("Listening on port :"+this.config.get("port"));
}

Lucid.prototype._getMiddleware = function(){
    return [
        [connect.favicon()],
        [connect.logger()],
        ["/static", connect.static(this.settings.rootPath + '/public')]
    ]
}

Lucid.prototype._bootstrap = function(){
    //TODO: make instances of any API or app manager classes.
}

Lucid.prototype._setupRouter = function(){
    var self = this;
    this.server.use(routerMiddleware(function(router){
        self.router = router;

        //begin routes

        //NOTE: calling next() is basically a 404 error

        router.add(new RegExp("^/foo/[a-zA-Z0-9]*/$"), function(req, res, next, path){
            res.setHeader('Content-Type', "text/html");
            res.write("It seems that the router worked!");
            res.end();
        });

        router.add(new RegExp("^(.*)"), function(req, res, next, path){
            res.setHeader('Content-Type', "text/html");
            res.write("I am kawaii uguu <a href='/static'>Some static content</a> ");
            res.write("or <a href='/foo/bar"+Math.round(Math.random()*10)+"/'>test the router</a>");
            res.end();
        });

        //TODO: set up the router to route to the app manager and APIs and such

        //end routes
    }));
}
