dojo.provide("lucid.user");

lucid.user = {
    isLoggedIn: function(options) {
        var d = new dojo.Deferred();
        if(options.onComplete) d.addCallback(options.onComplete);
        if(options.onError) d.addErrback(options.onError);
        dojo.xhrPost({
            url: "Class/User",
            postData: dojo.toJson({method: "getCurrentUser", id:"curUser", params:[null,null]}),
            handleAs: "json",
            load: function(data, ioArgs) {
                d.callback(data);
            },
            error: dojo.hitch(d, "errback")
        });
    }
};
