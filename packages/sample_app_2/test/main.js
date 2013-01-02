//var test = require("./test");
//test.foo == "bar"
var n = 1;
setInterval(function(){
    var foo = "bar";
    console.error("sample_app_2 (second container) is still running after "+(n*10)+" seconds!");
    n++;
}, 10000);
