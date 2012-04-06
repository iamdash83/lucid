commandHandler.on("someCommand", function(data, promise){
    promise.callback(data);
});
process.stderr.write("This is an error!");
