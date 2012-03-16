var Config = require("../Config");
var assert = require("assert");


var check_config = function(config){
    assert.equal(config.get("foo"), "bar", "key 'foo' is what we expected");
    assert.equal(config.get("someObj.baz"), "qux", "key 'someObj.baz' is what we expected");
    assert.equal(config.get("someBool"), true, "key 'someBool' is what we expected");

    assert.ok("Loaded config successfully");
}


suite("Config", function(){
    test("asynchronous loading of a configuration file", function(done){
        var config = new Config(__dirname+"/resources/sample_config.json");
        var wasCalled = false;

        config.load().then(function(){
            wasCalled = true;
            check_config(config);
            done();
        }, function(err){
            wasCalled = true;
            assert.error("Error when loading config: "+err);
            done();
        });
        
        setTimeout(function(){
            if(!wasCalled){
                assert.error("Hit timeout when trying to load config");
                done();
            }
        }, 1000);
    });
    test("synchronous loading of a configuration file", function(done){
        var config = new Config(__dirname+"/resources/sample_config.json");
        config.loadSync();
        check_config(config);
        done();
    });
});
