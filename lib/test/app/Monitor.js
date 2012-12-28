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
            if(module != expectedTriggeredModule)
                throw new Error("Module `"+module+"` started when it shouldn't have!");
        });
        m.on("stop", function(module){
            if(module != expectedTriggeredModule)
                throw new Error("Module `"+module+"` stopped when it shouldn't have!");
        });

        m.report("foo", Monitor.STATE_STARTED);
        expectedTriggeredModule = "";
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
            if(module != expectedTriggeredModule)
                throw new Error("Module `"+module+"` started when it shouldn't have!");
        });
        m.on("stop", function(module){
            if(module != expectedTriggeredModule)
                throw new Error("Module `"+module+"` stopped when it shouldn't have!");
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
    
    test("Watching a group of modules change state, but an error is triggered when one changes again before the watch is complete", function(done){
        var m = new Monitor(testMods);

        var shouldTrigger = false;
        var expectedTriggeredModule = "";

        m.watchStart(["bar", "baz"]).then(function(){
            throw new Error("Triggered success when we shouldn't have!");
        }, function(err){
            if(shouldTrigger)
                done();
            else
                throw new Error("Triggered error when we shouldn't have triggered at all!");
        });

        m.on("start", function(module){
            if(module != expectedTriggeredModule)
                throw new Error("Module `"+module+"` started when it shouldn't have!");
        });
        m.on("stop", function(module){
            if(module != expectedTriggeredModule)
                throw new Error("Module `"+module+"` stopped when it shouldn't have!");
        });

        m.report("bar", Monitor.STATE_STARTED);
        expectedTriggeredModule = "bar";
        m.report("bar", Monitor.STATE_STOPPED);
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

        //now we finish the watch and make sure things are being reported correctly
        m.report("foo", Monitor.STATE_STARTED);
        m.report("bar", Monitor.STATE_STARTED);

        assert(!m.isWatched(["foo", "bar"]));
    });

    //Monitor.finishWatching
    test("Monitor notifies us when it's done watching a set of modules", function(done){
        var m = new Monitor(testMods);
        var shouldTrigger = false;

        m.watchStart(["foo", "bar"]);
        m.finishWatch().then(function(){
            if(!shouldTrigger)
                throw new Error("Triggered finishWatch promise when we shouldn't have!");
            done();
        }, function(){
            throw new Error("this should never be thrown!");
        });

        //now we finish the watch and make sure things are being reported correctly
        m.report("foo", Monitor.STATE_STARTED);
        shouldTrigger = true;
        m.report("bar", Monitor.STATE_STARTED);
    });
    
    test("Monitor allows watches on individual sets of modules (intersection of sets = empty set)", function(done){
        var m = new Monitor(testMods);
        var firstCalled = false;
        var secondCalled = false;

        m.watchStart(["foo"]).then(function(){
            firstCalled = true;
            if(secondCalled) done();
        }, function(){
            throw new Error("Raised error during a reasonable watchStart call!");
        });
        
        m.watchStart(["b*"]).then(function(){
            secondCalled = true;
            if(firstCalled) done();
        }, function(){
            throw new Error("Raised error during a reasonable watchStart call!");
        });

        m.report("foo", Monitor.STATE_STARTED);
        m.report("bar", Monitor.STATE_STARTED);
        m.report("baz", Monitor.STATE_STARTED);
    });

    test("Monitor throws error when attempting to watch a module during another watch on that module", function(){
        var m = new Monitor(testMods);
        m.watchStart(["b*", "foo"]);

        //should throw error
        try{
            m.watchStart(["bar"]);
        }catch(e){
            assert.equal(e.message, "Already doing a watch on one or more of the specified modules!");
        }
    });
});
