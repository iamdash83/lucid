var Router = require("../../router/Router");
var assert = require("assert");

module.exports = {
    test_basic: function(assert, done){
        var router = new Router();
        var wasCalled = false;
        
        router.add(/^\/foo\//g, function(){
            assert.pass("successfully matched against /foo/");
            done();
        });

        router.route("/foo/bar").then(function(result){
            wasCalled = true;
            result();
        }, function(error){
            wasCalled = true;
            assert.error("failed to match /foo/bar/");
            done();
        });
        
        setTimeout(function(){
            if(!wasCalled){
                assert.error("Hit timeout when trying to match /foo/bar/");
                done();
            }
        }, 1000);
    }
}

if(module === require.main)
    require("test").run(module.exports);
