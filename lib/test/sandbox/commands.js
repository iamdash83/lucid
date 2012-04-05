var assert = require("assert")
  , fs = require("fs")
  , util = require("./util")
  , CommandHandler = require("../../sandbox/CommandHandler")
  , CommandSender = require("../../sandbox/CommandSender")
  , _ = require("underscore/underscore");

suite("sandbox/commands (part of test suite)", function(){
    var STDIN_PATH = __dirname+"/../resources/sandbox/fakeCommandStdin.sock";
    var STDOUT_PATH = __dirname+"/../resources/sandbox/fakeCommandStdout.sock";
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

    test("A message sent through a CommandSender causes a CommandHandler to emit an event, and a response is sent back", function(done){
        var ch = new CommandHandler(stdout, stdin);
        var cs = new CommandSender(stdout_reader, stdin_writer);
        ch.on("foo", function(data, promise){
            promise.callback(data);
        });
        cs.on("ready", function(){
            cs.send("foo", TEST_OBJECT).then(function(data){
                assert.deepEqual(TEST_OBJECT, data);
                done();
            });
        });
        ch.ready();
    });

    test("A ping sent through CommandSender causes CommandHandler to send back a pong", function(done){
        var ch = new CommandHandler(stdout, stdin);
        var cs = new CommandSender(stdout_reader, stdin_writer);
        cs.on("ready", function(){
            cs.ping(200).then(function(){
                done();
            });
        });
        ch.ready();
    });
    
    test("A ping sent through CommandSender with a timeout of zero causes a timeout", function(done){
        var ch = new CommandHandler(stdout, stdin);
        var cs = new CommandSender(stdout_reader, stdin_writer);
        cs.on("ready", function(){
            cs.ping(0).then(function(){
                assert.fail("Callback called!");
            }, function(){
                done();
            });
        });
        ch.ready();
    });
});
