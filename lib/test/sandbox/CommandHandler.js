var assert = require("assert")
  , fs = require("fs")
  , util = require("./util")
  , CommandHandler = require("../../sandbox/CommandHandler")
  , _ = require("underscore/underscore");

//I'm going to admit that these test cases are very quick-and-dirty
//so someone might want to rewrite them later or something.

suite("sandbox/CommandHandler", function(){
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
    var stdout_reader;

    setup(function(done){
        var isDone = {
            stdin: false,
            stdout: false
        }
        var check = function(name){
            isDone[name] = true;
            if(isDone.stdin && isDone.stdout){
                stdin_writer.setEncoding("utf8");
                stdout_reader.setEncoding("utf8");
                done();
            }
        }
        util.socketPair(STDIN_PATH, function(one, two){
            stdin = one;
            stdin_writer = two;
            check("stdin");
        });
        util.socketPair(STDOUT_PATH, function(one, two){
            stdout = one;
            stdout_reader = two;
            check("stdout");
        });
    });

    teardown(function(){
        stdin.destroy();
        stdout.destroy();
        //fs.writeFileSync(STDIN_PATH, "");
        //fs.writeFileSync(STDOUT_PATH, "");
    });

    test("CommandHandler invokes events when it gets a command", function(done){
        var ch = new CommandHandler(stdout, stdin);
        ch.on("testCommand", function(args, promise){
            assert.deepEqual(args, TEST_OBJECT);
            assert(promise.promise);
            done();
        });

        //if we get a response, that means we did something wrong,
        //since testCommand doesn't send a response
        stdout_reader.on("data", function(response){
            response.split("\n").forEach(function(item){
                if(item == "") return;
                var packet = JSON.parse(item);
                if(!packet.ready){ //ready packets are ok
                    assert.fail("Got data back when we weren't supposed to! Probably an error response!");
                    done();
                }
            });
        });
        
        //send a dummy command
        stdin_writer.write(JSON.stringify({
            command: "testCommand",
            args: TEST_OBJECT,
            responseId: 1
        })+"\n");
    });
    
    test("CommandHandler invokes events when it gets several commands", function(done){
        var ch = new CommandHandler(stdout, stdin);
        var counter = 0;
        var NUM_COMMANDS = 20;

        //get a response from the CommandHandler
        ch.on("testCommand", function(args, promise){
            var responseId = args.responseId;
            delete args.responseId;
            assert(responseId >= 1 && responseId <= 20);
            assert.deepEqual(args, TEST_OBJECT);
            assert(promise.promise);
            counter++;
            if(counter >= NUM_COMMANDS){
                done();
            }
        });
        
        //if we get a response, that means we did something wrong,
        //since testCommand doesn't send a response
        var doneCalled = false;
        stdout_reader.on("data", function(response){
            response.split("\n").forEach(function(item){
                if(item == "") return;
                var packet = JSON.parse(item);
                if(!packet.ready){ //ready packets are ok
                    assert.fail("Got data back when we weren't supposed to! Probably an error response!", packet);
                    //prevent multiple calls to done just to prevent confusion
                    if(!doneCalled){
                        doneCalled = true;
                        done();
                    }
                }
            });
        });

        //send 20 commands back to back
        for(var i=0; i < NUM_COMMANDS; i++){
            var obj = _.defaults({responseId: i+1}, TEST_OBJECT);
            stdin_writer.write(JSON.stringify({
                command: "testCommand",
                args: obj,
                responseId: i+1
            })+"\n");
        }
    });

    test("CommandHandler successfully sends a single response", function(done){
        var ch = new CommandHandler(stdout, stdin);
        ch.on("testCommand", function(args, promise){
            promise.callback(TEST_OBJECT);
        });

        //if we get a response, that means we did something wrong,
        //since testCommand doesn't send a response
        stdout_reader.on("data", function(response){
            response.split("\n").forEach(function(item){
                if(item == "") return;
                var packet = JSON.parse(item);
                if(packet.error){
                    assert.fail("Got error data back when we weren't supposed to!");
                    done();
                }else if(!packet.ready){
                    assert.deepEqual(packet.data, TEST_OBJECT);
                    done();
                }
            });
        });
        
        //send a dummy command
        stdin_writer.write(JSON.stringify({
            command: "testCommand",
            args: TEST_OBJECT,
            responseId: 1
        })+"\n");
    });
    
    test("CommandHandler successfully sends back an error if a single command throws one", function(done){
        var ch = new CommandHandler(stdout, stdin);
        ch.on("testCommand", function(args, promise){
            throw new Error("random error");
        });

        //if we get a response, that means we did something wrong,
        //since testCommand doesn't send a response
        stdout_reader.on("data", function(response){
            response.split("\n").forEach(function(item){
                if(item == "") return;
                var packet = JSON.parse(item);
                if(packet.error){
                    assert.equal(packet.error.message, "random error");
                    done();
                }else if(!packet.ready){
                    assert.fail("Got a response back even though there was an error!");
                    done();
                }
            });
        });
        
        //send a dummy command
        stdin_writer.write(JSON.stringify({
            command: "testCommand",
            args: TEST_OBJECT,
            responseId: 1
        })+"\n");
    });
    
    test("CommandHandler successfully sends back an error if a single command returns an errback", function(done){
        var ch = new CommandHandler(stdout, stdin);
        ch.on("testCommand", function(args, promise){
            promise.errback(new Error("random error"));
        });

        //if we get a response, that means we did something wrong,
        //since testCommand doesn't send a response
        stdout_reader.on("data", function(response){
            response.split("\n").forEach(function(item){
                if(item == "") return;
                var packet = JSON.parse(item);
                if(packet.error){
                    assert.equal(packet.error.message, "random error");
                    done();
                }else if(!packet.ready){
                    assert.fail("Got a response back even though there was an error!");
                    done();
                }
            });
        });
        
        //send a dummy command
        stdin_writer.write(JSON.stringify({
            command: "testCommand",
            args: TEST_OBJECT,
            responseId: 1
        })+"\n");
    });

    test("CommandHandler successfully sends multiple responses w/o mixing them up", function(done){
        var ch = new CommandHandler(stdout, stdin);
        var NUM_COMMANDS = 20;

        //get a response from the CommandHandler
        for(var i=1; i <= NUM_COMMANDS; i++){
            //need to wrap it in a function because for loops
            //don't provide the right context control stuff.
            //basically, i would equal 21 by the time the
            //event passed through ch.on is called if we didn't
            //do this.
            (function(){
                var j = i;
                ch.on("testCommand"+j, function(args, promise){
                    var responseId = args.responseId;
                    assert.equal(j, responseId);
                    promise.callback(args);
                });
            })();
        }
        
        //if we get a response, that means we did something wrong,
        //since testCommand doesn't send a response
        var doneCalled = false;
        var callbacksRecieved = {};
        var callbacksAreDone = function(){
            for(var i=1; i <= NUM_COMMANDS; i++){
                if(!callbacksRecieved[i]){
                    return false;
                }
            }
            return true;
        }

        //send responses
        stdout_reader.on("data", function(response){
            response.split("\n").forEach(function(item){
                if(item == "") return;
                var packet = JSON.parse(item);
                if(!packet.ready && !packet.error){ //ready packets are ok
                    var responseId = packet.data.responseId;
                    delete packet.data.responseId;
                    assert.deepEqual(packet.data, TEST_OBJECT);
                    callbacksRecieved[responseId] = true;
                    if(callbacksAreDone()){
                        done();
                    }
                }else if(packet.error){
                    assert.fail("Got data back when we weren't supposed to! Probably an error response!", packet);
                    //prevent multiple calls to done just to prevent confusion
                    if(!doneCalled){
                        doneCalled = true;
                        done();
                    }
                }
            });
        });

        //send 20 commands back to back
        for(var i=1; i <= NUM_COMMANDS; i++){
            var obj = _.defaults({responseId: i}, TEST_OBJECT);
            stdin_writer.write(JSON.stringify({
                command: "testCommand"+i,
                args: obj,
                responseId: i
            })+"\n");
        }
    });

    test("CommandHandler successfully sends back an error if one of many commands throws one", function(done){
        var ch = new CommandHandler(stdout, stdin);
        var chosenErrorResponseId = null;
        var NUM_COMMANDS = 20;

        //get a response from the CommandHandler
        chosenErrorResponseId = Math.round(Math.random()*(NUM_COMMANDS-1))+1
        ch.on("testCommand", function(args, promise){
            var responseId = args.responseId;
            if(responseId == chosenErrorResponseId){
                promise.errback(new Error(responseId));
            }else{
                promise.callback(args);
            }
        });
        
        //if we get a response, that means we did something wrong,
        //since testCommand doesn't send a response
        stdout_reader.on("data", function(response){
            response.split("\n").forEach(function(item){
                if(item == "") return;
                var packet = JSON.parse(item);
                if(packet.error){
                    assert.equal(packet.error.message, chosenErrorResponseId);
                    done();
                }
            });
        });

        //send 20 commands back to back
        for(var i=0; i < NUM_COMMANDS; i++){
            var obj = _.defaults({responseId: i+1}, TEST_OBJECT);
            stdin_writer.write(JSON.stringify({
                command: "testCommand",
                args: obj,
                responseId: i+1
            })+"\n");
        }
    });

    test("CommandHandler sends back a pong packet when pinged");
});