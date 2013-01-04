//var test = require("./test");
//test.foo == "bar"

var n = 0;
var started = new Date();

rpc.expose("web", function(path){
    var p = new Promise();

    console.error("got a request!", path);

    console.error((new Error("bla")).stack);
    
    if(path != "")
        p.errback(new Error("404"));
    else
        p.callback(
               "<h1>It Works!</h1>"
             + "<p>This is a Lucid app responding to a web request!</p>"
             + "<ul>"
             + "<li>Run Time: "+n+" seconds</li>"
             + "<li>PID: "+process.pid+"</li>"
             + "<li>Time Started: "+started+" </li>"
             + "<li>Time Now: "+new Date()+" </li>"
             + "</ul>"
        );

    return p;
});

setInterval(function(){
    n++;
}, 1000);
