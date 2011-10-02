var Config = require("./Config");
var connect = require("connect");

var Lucid = module.exports = function(settings){
    this.settings = settings;
    this.config = new Config(settings.config);
    this.router = null;
    this.server = null;

    var self = this;
    this.config.load().then(function(){
        self._setupServer();
        self._setupRouter();
    }, function(error){
        //TODO: better way of logging
        require("sys").puts("Error reading config file");
    });
}

Lucid.prototype._setupServer = function(){
    var middleware = this._getMiddleware();
    var server = this.server = connect.createServer.apply(connect, middleware);
    server.listen(this.config.get("port"));
    //TODO: better way of logging
    require("sys").puts("Listening on port :"+this.config.get("port"));
}

Lucid.prototype._getMiddleware = function(){
    return [
        connect.favicon(),
        connect.logger(),
        connect.static(this.settings.rootPath + '/public')
    ]
}

Lucid.prototype._setupRouter = function(){

}
