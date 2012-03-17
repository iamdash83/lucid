var assert = require("assert")
  , fs = require("fs")
  , util = require("./util")
  , CommandHandler = require("../../sandbox/CommandHandler");

suite("sandbox/CommandHandler", function(){
    var STDIN_PATH = __dirname+"/../resources/sandbox/fakeStdin.sock";
    var STDOUT_PATH = __dirname+"/../resources/sandbox/fakeStdout.sock";
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
        ch.on("testCommand", function(args, responseid){
            assert.deepEqual(args, {foo: "bar"});
            assert.equal(responseid, 1);
            done();
        });
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
        stdin_writer.write(JSON.stringify({
            command: "testCommand",
            args: {foo: "bar"},
            responseId: 1
        })+"\n");
    });
    
    test("CommandHandler invokes events when it gets several commands", function(done){
        var ch = new CommandHandler(stdout, stdin);
        var counter = 0;
        var NUM_COMMANDS = 20;
        ch.on("testCommand", function(args, responseid){
            assert.deepEqual(args, {foo: "bar"});
            assert.equal(responseid, 1);
            counter++;
            if(counter >= NUM_COMMANDS){
                done();
            }
        });
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
        for(var i=0; i < NUM_COMMANDS; i++){
            stdin_writer.write(JSON.stringify({
                command: "testCommand",
                args: {foo: "bar"},
                responseId: 1
            })+"\n");
        }
    });

    test("CommandHandler successfully sends a single response", function(done){
        //TODO
        done();
    });

    test("CommandHandler successfully sends multiple responses w/o mixing them up", function(done){
        //TODO
        done();
    });
});
