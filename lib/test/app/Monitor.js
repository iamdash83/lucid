var Monitor = require("../../app/Monitor");
var assert = require("assert");

var testMods = [
    "foo",
    "bar",
    "baz"
];

suite("app/Monitor", function(){
    
    var throwShouldntCall = function(){
        throw new Error("This method shouldn't have been called!");
    }

    test("Watching a group of modules change state", function(done){
        var m = new Monitor(testMods);

        var shouldTrigger = false;
        var expectedTriggeredModule = "foo";

        m.watchStart(["bar", "baz"]).then(function(){
            if(shouldTrigger)
                done();
            else
                throw new Error("Triggered when we shouldn't have!");
        }, function(err){
            if(shouldTrigger)
                throw err;
            else
                throw new Error("Triggered error when we shouldn't have triggered at all!");
        });

        m.on("start", function(module){
            if(module != expectedTriggeredModule) throwShouldntCall();
        });
        m.on("stop", function(module){
            if(module != expectedTriggeredModule) throwShouldntCall();
        });

        m.report("foo", Monitor.STATE_STARTED);
        m.report("bar", Monitor.STATE_STARTED);
        shouldTrigger = true;
        m.report("baz", Monitor.STATE_STARTED);
        
        //test aftereffects just to make sure
        //triggers are properly popped off the tree
        process.nextTick(function(){
            shouldTrigger = false;
            expectedTriggeredModule = "baz";
            m.report("baz", Monitor.STATE_STOPPED);
            m.report("baz", Monitor.STATE_STARTED);
        });
    });
    
    test("Watching a group of modules change state (specified with wildcard)", function(done){
        var m = new Monitor(testMods);

        var shouldTrigger = false;
        var expectedTriggeredModule = "";

        m.watchStart(["*"]).then(function(){
            if(shouldTrigger)
                done();
            else
                throw new Error("Triggered when we shouldn't have!");
        }, function(err){
            if(shouldTrigger)
                throw err;
            else
                throw new Error("Triggered error when we shouldn't have triggered at all!");
        });

        m.on("start", function(module){
            if(module != expectedTriggeredModule) throwShouldntCall();
        });
        m.on("stop", function(module){
            if(module != expectedTriggeredModule) throwShouldntCall();
        });

        m.report("bar", Monitor.STATE_STARTED);
        m.report("baz", Monitor.STATE_STARTED);
        shouldTrigger = true;
        m.report("foo", Monitor.STATE_STARTED);
        
        //test aftereffects just to make sure
        //triggers are properly popped off the tree
        process.nextTick(function(){
            shouldTrigger = false;
            expectedTriggeredModule = "baz";
            m.report("baz", Monitor.STATE_STOPPED);
            m.report("baz", Monitor.STATE_STARTED);
        });
    });

    //Monitor.allInState
    test("Monitor tells us if a group of modules are in a certain state", function(){
        var m = new Monitor(testMods);

        m.report("bar", Monitor.STATE_STARTED);
        m.report("baz", Monitor.STATE_STARTED);

        assert(m.allInState(["bar", "baz"], Monitor.STATE_STARTED));
        assert(!m.allInState(["foo", "bar"], Monitor.STATE_STARTED));
    });
    
    //Monitor.isWatched
    test("Monitor tells us if a group of modules are being watched", function(){
        var m = new Monitor(testMods);

        assert(!m.isWatched(["foo", "bar"]));

        m.watchStart(["foo", "bar"]);
        assert(m.isWatched(["foo", "bar"]));
        assert(m.isWatched(["baz", "bar"]));
        assert(!m.isWatched(["baz"]));
    });

    //Monitor.finishWatching
    test("Monitor notifies us when it's done watching a set of modules");
});
