var assert = require("assert")
  , fs = require("fs")
  , util = require("./util");

suite("sandbox/CommandHandler", function(){
    var STDIN_PATH = __dirname+"/../resources/sandbox/fakeStdin.sock";
    var STDOUT_PATH = __dirname+"/../resources/sandbox/fakeStdout.sock";
    var stdin;
    var stdout;
    var stdin_listener;
    var stdout_writer;

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
            stdin_listener = two;
            check("stdin");
        });
        util.socketPair(STDOUT_PATH, function(one, two){
            stdout = one;
            stdout_writer = two;
            check("stdout");
        });
    });

    teardown(function(){
        stdin.destroy();
        stdout.destroy();
        //fs.writeFileSync(STDIN_PATH, "");
        //fs.writeFileSync(STDOUT_PATH, "");
    });

    test("CommandHandler sends a ready signal", function(done){
        //TODO
        done();
    });
    
    test("CommandHandler accepts commands with no arguments", function(done){
        //TODO
        done();
    });
    
    test("CommandHandler accepts commands with arguments", function(done){
        //TODO
        done();
    });
});
