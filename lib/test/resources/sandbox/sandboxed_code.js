commandHandler.on("someCommand", function(data, promise){
    promise.callback(data);
});
