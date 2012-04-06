var assert = require("assert")
  , fs = require("fs")
  , util = require("./util")
  , CommandSender = require("../../sandbox/CommandSender")
  , _ = require("underscore/underscore");

//I'm going to admit that these test cases are very quick-and-dirty
//so someone might want to rewrite them later or something.

suite("sandbox/CommandSender", function(){
    var STDIN_PATH = __dirname+"/../resources/sandbox/fakeStdin.sock";
    var STDOUT_PATH = __dirname+"/../resources/sandbox/fakeStdout.sock";
    var TEST_OBJECT = {
        foo: "bar",
        baz: "qux",
        testInt: 4
    };
    var stdin;
    var stdout;
    var stdin_writer;
    var stdout_listener;

    setup(function(done){
        var isDone = {
            stdin: false,
            stdout: false
        }
        var check = function(name){
            isDone[name] = true;
            if(isDone.stdin && isDone.stdout)
                done();
        }
        util.socketPair(STDIN_PATH, function(one, two){
            stdin = one;
            stdin_writer = two;
            stdin_writer.setEncoding('utf8'); //because I'm lazy
            check("stdin");
        });
        util.socketPair(STDOUT_PATH, function(one, two){
            stdout = one;
            stdout_listener = two;
            stdout_listener.setEncoding('utf8'); //because I'm lazy
            check("stdout");
        });
    });

    teardown(function(){
        stdin.destroy();
        stdout.destroy();
        //fs.writeFileSync(STDIN_PATH, "");
        //fs.writeFileSync(STDOUT_PATH, "");
    });

    test("CommandSender accepts a ready signal", function(done){
        var cs = new CommandSender(stdin, stdout); //flipped because it's used in the parent proc
        cs.on("ready", function(){
            done();
        });
        stdin_writer.write('{"ready": true}\n');
    });

    test("CommandSender throws error if sending a command before ready", function(){
        var cs = new CommandSender(stdin, stdout); //flipped because it's used in the parent proc
        assert.throws(function(){
            cs.send("testCommand", TEST_OBJECT);
        }, Error);
    });
    
    test("CommandSender sends a single command", function(done){
        var cs = new CommandSender(stdin, stdout); //flipped because it's used in the parent proc
        stdin_writer.write('{"ready": true}\n');
        cs.on("ready", function(){
            stdout_listener.on("data", function(data){
                var packet = JSON.parse(data);
                assert.equal(packet.command, "testCommand");
                assert.deepEqual(packet.args, TEST_OBJECT);
                done();
            });
            cs.send("testCommand", TEST_OBJECT);
        });
    });
    
    test("CommandSender sends multiple commands w/ unique responseids", function(done){
        var NUM_COMMANDS = 20;

        var cs = new CommandSender(stdin, stdout); //flipped because it's used in the parent proc
        stdin_writer.write('{"ready": true}\n');

        cs.on("ready", function(){
            var counter = 0;
            var responseIds = {};
            stdout_listener.on("data", function(data){
                data.split("\n").forEach(function(item){
                    if(item == "") return;
                    var packet = JSON.parse(item);

                    if(responseIds[packet.responseId]){
                        assert.fail("Identical responseIds found!", packet.responseId);
                    }else{
                        responseIds[packet.responseId] = true;
                    }

                    counter++;
                    if(counter >= NUM_COMMANDS)
                        done();
                });
            });
            for(var i=0; i<NUM_COMMANDS; i++)
                cs.send("testCommand", TEST_OBJECT);
        });
    });

    test("CommandSender handles a single response", function(done){
        var cs = new CommandSender(stdin, stdout); //flipped because it's used in the parent proc
        stdin_writer.write('{"ready": true}');

        stdout_listener.on("data", function(data){
            data.split("\n").forEach(function(item){
                if(item == "") return;
                var packet = JSON.parse(item);
                assert.equal(packet.command, "testCommand");
                stdin_writer.write(JSON.stringify({
                    data: TEST_OBJECT,
                    responseId: packet.responseId
                })+"\n");
            });
        });

        cs.on("ready", function(){
            cs.send("testCommand", TEST_OBJECT).then(function(data){
                assert.deepEqual(data, TEST_OBJECT);
                done();
            }, function(err){
                assert.fail("errback called!", err);
            });
        });
    });

    test("CommandSender handles multiple responses w/o mixing them up", function(done){
        var NUM_COMMANDS = 20;
        var cs = new CommandSender(stdin, stdout); //flipped because it's used in the parent proc
        stdin_writer.write('{"ready": true}\n');

        stdout_listener.on("data", function(data){
            data.split("\n").forEach(function(item){
                if(item == "") return;
                var packet = JSON.parse(item);
                stdin_writer.write(JSON.stringify({
                    data: _.defaults({command: packet.command}, TEST_OBJECT),
                    responseId: packet.responseId
                })+"\n");
            });
        });

        cs.on("ready", function(){
            var counter = 0;
            for(var i=1; i <= NUM_COMMANDS; i++){
                (function(){
                    var j = i;
                    cs.send("testCommand"+j, TEST_OBJECT).then(function(data){
                        var command = data.command;
                        delete data.command;
                        assert.equal("testCommand"+j, command);
                        assert.deepEqual(data, TEST_OBJECT);
                        counter++;
                        if(counter >= NUM_COMMANDS)
                            done();
                    }, function(err){
                        assert.fail("errback called!", err);
                    });
                })();
            }
        });
    });
    
    test("CommandSender sends a ping packet");
    test("CommandSender handles a pong packet after being pinged");
});
