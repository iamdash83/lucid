var connect = require("connect");

exports = {
    _server: null,

    getInstance: function(){
        if(!this._server){
            this._server = this.createServer();
        }
        return this._server;
    },

    createServer: function(){
        var middleware = this.getMiddleware();
        var server = connect.createServer.call(connect, middleware);
    },

    getMiddleware: function(){
        return [
            
        ];
    }
}
