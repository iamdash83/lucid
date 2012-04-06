var Sandbox = require("../../sandbox/Sandbox")
  , path = require('path')
  , assert = require("assert");

suite("sandbox/Sandbox", function(){
    var TEST_CODE_PATH = path.join(__dirname, "../resources/sandbox/sandboxed_code.js");

    test("Sandbox starts", function(done){
        var sb = new Sandbox(TEST_CODE_PATH);
        sb.run();

        //DEBUG CODE
        /*
        sb._process.stdout.setEncoding("utf8");
        sb._process.stdout.on("data", function(data){
            console.log(data);
        });
        //*/

        sb.on("ready", function(){
            assert(sb._isRunning);
            sb.command.send("someCommand", {foo: "bar"}).then(function(data){
                assert.deepEqual({foo: "bar"}, data);
                done();
            });
        });
    });

    test("Sandbox generates 'ping' events", function(done){
        var sb = new Sandbox(TEST_CODE_PATH, {
            check_interval: 10
        });
        sb.run();

        sb.once("ping", function(time){
            assert(time >= 0);
            done();
        });
    });
    
    test("Sandbox generates 'stderr' events", function(done){
        var sb = new Sandbox(TEST_CODE_PATH);
        sb.run();

        sb.once("stderr", function(data){
            //console.log(data.toString());
            assert(data);
            done();
        });
    });
});
