var assert = require("assert");
var moduleSelector = require("../moduleSelector");

suite("moduleSelector", function(){

    var testMods = ["a1one", "a2one",
                    "b1one", "b2one",
                    "a1two", "a2two",
                    "b1two", "b2two"];


    test("Selecting via whitelist only", function(){
        var res;

        res = moduleSelector.applyFiltering(testMods, ["a*"]);
        assert.deepEqual(res.sort(), ["a1one", "a1two", "a2one", "a2two"]);
        
        res = moduleSelector.applyFiltering(testMods, ["*one"]);
        assert.deepEqual(res.sort(), ["a1one", "a2one", "b1one", "b2one"]);
        
        res = moduleSelector.applyFiltering(testMods, ["*1*"]);
        assert.deepEqual(res.sort(), ["a1one", "a1two", "b1one", "b1two"]);

        res = moduleSelector.applyFiltering(testMods, ["*1*", "a*"]);
        assert.deepEqual(res.sort(), ["a1one", "a1two", "a2one", "a2two", "b1one", "b1two"]);
    });


    test("Selecting via blacklist only", function(){
        var res;

        res = moduleSelector.applyFiltering(testMods, null, ["a*"]);
        assert.deepEqual(res.sort(), ["b1one", "b1two", "b2one", "b2two"]);
        
        res = moduleSelector.applyFiltering(testMods, null, ["*one"]);
        assert.deepEqual(res.sort(), ["a1two", "a2two", "b1two", "b2two"]);
        
        res = moduleSelector.applyFiltering(testMods, null, ["*1*"]);
        assert.deepEqual(res.sort(), ["a2one", "a2two", "b2one", "b2two"]);

        res = moduleSelector.applyFiltering(testMods, null, ["a*", "*1*"]);
        assert.deepEqual(res.sort(), ["b2one", "b2two"]);
    });


    test("Selecting via whitelist and blacklist", function(){
        var res;

        res = moduleSelector.applyFiltering(testMods, ["*one"], ["a*"]);
        assert.deepEqual(res.sort(), ["b1one", "b2one"]);
        
        res = moduleSelector.applyFiltering(testMods, ["a*", "*one"], ["*1*"]);
        assert.deepEqual(res.sort(), ["a2one", "a2two", "b2one"]);
    });
});
