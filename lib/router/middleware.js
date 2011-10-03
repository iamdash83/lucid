var Router = require("Router");

var middleware = module.exports = function(options){
    var router = new Router();
    options(router);
    return function(req, res, next){
        router.route().then(function(route){
            //TODO: if we throw a 404 error, call next()
            route(req, res);
        }, function(error){
            return next(error);
        });
    }
}
