var Router = require("./Router");

var middleware = module.exports = function(options){
    var router = new Router();
    options(router);
    return function(req, res, next){
        router.route(req.url).then(function(route){
            //TODO: if we throw a 404 error, call next()
            route(req, res, next);
        }, function(error){
            return next(error);
        });
    }
}
