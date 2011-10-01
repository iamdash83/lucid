var Config = require("../Config");
var assert = require("assert");

var tests = module.exports = {
    test_basic: function(assert, done){
        var config = new Config(__dirname+"/resources/sample_config.json");
        var wasCalled = false;

        config.load().then(function(){
            wasCalled = true;
            tests.check_config(assert, done, config);
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
    },
    test_synchronous_load: function(assert, done){
        var config = new Config(__dirname+"/resources/sample_config.json");
        config.loadSync();
        tests.check_config(assert, done, config);
    },
    check_config: function(assert, done, config){
        assert.equal(config.get("foo"), "bar", "key 'foo' is what we expected");
        assert.equal(config.get("someObj.baz"), "qux", "key 'someObj.baz' is what we expected");
        assert.equal(config.get("someBool"), true, "key 'someBool' is what we expected");

        assert.pass("Loaded config successfully");
        done();
    }
}

if(module === require.main)
    require("test").run(module.exports);
