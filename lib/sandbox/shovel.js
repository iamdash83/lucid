(function(){
    var CommandHandler = require("./CommandHandler")
      , requireFactory = require("./requireFactory")
      , fs = require("fs")
      , vm = require("vm");

    process.stdin.resume();
    //make a new CommandHandler and expose it globally
    var ch = new CommandHandler(process.stdout, process.stdin);
    global.commandHandler = ch; //TODO: pick better name
    
    process.stdin.on("data", function(data){
        process.stderr.write(data);
    });

    ch.once("init", function(startData, promise){
        //seal off require() before loading any code
        global.require = requireFactory(global.require, startData.permissions);

        //load the file
        fs.readFile(startData.path, function(err, data){
            if(err){
                //write error to stderr if we can't load the file
                process.stderr.write(err.toString());
                promise.errback(err);
                //then die
                process.exit(1);
            }else{
                //run the app
                var script = vm.createScript(data, startData.path);
                promise.callback();
                //according to node's docs, runInThisContext doesn't
                //run it in the local scope, but rather our global scope.
                //so just calling this here should be cool.
                //see http://nodejs.org/api/vm.html#vm_script_runinthiscontext
                script.runInThisContext();
            }
        });
    });

    ch.ready();

})();
