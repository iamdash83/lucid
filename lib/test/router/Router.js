var Router = require("../../router/Router");
var assert = require("assert");

suite("router/Router", function(){
    test("basic routes using matching regex", function(done){
        var router = new Router();
        var wasCalled = false;
        
        router.add(/^\/bar\//, function(){
            wasCalled = true;
            assert.error("successfully matched, but for /bar/, not /foo/");
            done();
        });
        
        router.add(/^\/foo\//, function(){
            wasCalled = true;
            assert.ok("successfully matched against /foo/");
            done();
        });

        router.route("/foo/bar").then(function(result){
            result();
        }, function(error){
            assert.error("failed to match /foo/bar/");
            done();
        });
        
        setTimeout(function(){
            if(!wasCalled){
                assert.error("Hit timeout when trying to match /foo/bar/");
                done();
            }
        }, 1000);
    });

    test("Matching against a regex and returning the backreferences as arguments", function(done){
        var router = new Router();
        var wasCalled = false;
        
        router.add(/^\/foo\/([a-zA-Z]*)\/([0-9]*)\/$/, function(argFromCall, argFromRouter, anotherArgFromRouter){
            wasCalled = true;
            assert.equal(argFromCall, "argument from call", "Argument from call");
            assert.equal(argFromRouter, "bar", "Argument from router");
            assert.equal(anotherArgFromRouter, "123", "Second argument from router");
            assert.ok("successfully matched against /foo/([a-zA-Z]*)/([0-9]*)/");
            done();
        });

        router.route("/foo/bar/123/").then(function(result){
            result("argument from call");
        }, function(error){
            assert.error("failed to match /foo/bar/123/");
            done();
        });
        
        setTimeout(function(){
            if(!wasCalled){
                assert.error("Hit timeout when trying to match /foo/bar/123/");
                done();
            }
        }, 1000);
    });

    test("Chaining routers and backreference preservation from the parent router", function(done){
        var router1 = new Router();
        var router2 = new Router();
        var wasCalled = false;

        router1.add(/^\/([a-zA-Z]*)/, router2);

        router2.add(/^\/([a-zA-Z]*)\/$/, function(argFromCall, argFromRouter1, argFromRouter2){
            wasCalled = true;
            assert.equal(argFromCall, "argument from call", "Argument from call");
            assert.equal(argFromRouter1, "foo", "Argument from router 1");
            assert.equal(argFromRouter2, "bar", "Argument from router 2");
            assert.ok("Successfully matched against /([a-zA-Z]*)/([a-zA-Z]*)/ with chained routers");
            done();

        });
        
        router1.route("/foo/bar/").then(function(result){
            result("argument from call");
        }, function(error){
            assert.error("failed to match /foo/bar/");
            done();
        });

        setTimeout(function(){
            if(!wasCalled){
                assert.error("Hit timeout when trying to match /foo/bar/123/");
                done();
            }
        }, 1000);

    });
});
