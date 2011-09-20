var router = exports = {
    //  summary:
    //      URL Routing class. Supports live loading and unloading
    //      of URL routes and such.

    route: function(req, res, next){
        //  summary:
        //      Routes a given request.
    },


    //  _routes: Object
    //      A list of routes to resolve.
    //      The URL resolver will hit this. The default route list will have
    //      some stuff in there so the app resolver will be called if
    //      the URL pattern matches an app's. So basically this is
    //      only really going to hold URL patterns for Lucid itself.
    _routes: [
        {
            match: new RegExp("^/$"),
            route: router._handleRootRoute
        },
        {
            match: new RegExp("^/application/([a-zA-Z0-9\\-\\_]*)/(.*)"),
            route: router._handlePrivateAppRoute
        },
        {
            match: new RegExp("^/user/([a-zA-Z0-9\\-\\_]*)/([a-zA-Z0-9\\-\\_]*)/(.*)"),
            route: router._handlePublicAppRoute
        }
        //TODO: API/system routes?
    ],

    _handleRootRoute: function(match, req, res, next){
        //  summary:
        //      Figures out what to do when we get a request on the root level of our app.

    },

    _handlePrivateAppRoute: function(match, req, res, next){
        //  summary:
        //      Figures out what to do when we get a private app request on our app.
        return this._handleAppRoute(match[0], match[1], "private", req, res, next);
    },

    _handlePublicAppRoute: function(match, req, res, next){
        //  summary:
        //      Figures out what to do when we get a public request on our app.
        return this._handleAppRoute(match[0], match[1], "public", req, res, next);
    },

    _handleAppRoute: function(app, path, type, req, res, next){

    },



    //  _appRoutes: Object
    //      Example structure:
    //      {
    //          appname: {
    //              public: [
    //                  {match: RegExp, route: Function(req, res, next)}
    //              ],
    //              private: [
    //                  {match: RegExp, route: Function(req, res, next)}
    //              ]
    //          }
    //      }
    //      We're using this data structure because
    //      it's faster to do lookups by app name if the app
    //      name can be parsed from a predictable pattern
    //      rather than just drilling through a list of routes
    //      with the app name being matched in each route's regexp.
    //      We could make this faster with another data structure (which would use more RAM), but
    //      provided people aren't installing > 100 apps, it should be fine.
    _appRoutes: {},

    addAppRoutes: function(/*String*/appname, /*Object*/routes){
        //  summary:
        //      adds routing patterns for the given app for the URL router to resolve
        //  appname:
        //      The application sysname that these URL routes are for
        //  routes:
        //      An object with the following schema:
        //      {
        //          public: [ {match: RegExp, route: Function(req, res, next)} ],
        //          private: [ {match: RegExp, route: Function(req, res, next)} ],
        //      }
        //      The public and private arrays may contain multiple routes.
        if(!this._appRoutes[appname])
            this._appRoutes[appname] = {};
        for(var key in routes){
            var type = routes[key];
            if(this._appRoutes[appname][type])
                this._appRoutes[appname][type] = [];
            this.appRoutes[appname][type] = this.appRoutes[appname][type].concat(routes);
        }
    },

    removeAppRoutes: function(/*String*/appname){
        //  summary:
        //      removes routing patterns for a given application
        //  appname:
        //      The sysname of the app to remove the routes for
        if(this._appRoutes[appname])
            delete this._appRoutes[appname];
    },

    mapAppUrlToFunction: function(/*String*/appname, /*String*/type, /*String*/uri){
        //  summary:
        //      Maps a given appname and uri to a function
        //  appname:
        //      The sysname of the app that we're mapping against
        //  type:
        //      The type of url that we're mapping to ("public" or "private")
        //  uri:
        //      The portion of the url after the pattern that indicates the type (eg for /application/MyApp/foo/bar/ this would be /foo/bar/)

        if(this._appRoutes[appname] && this._appRoutes[appname][type]){
            for(var key in this._appRoutes[appname][type]){
                var route = this._appRoutes[appname][type][key];
                if(route.match.test(uri)){
                    return route.route; //Function
                }
            }
            //we didn't find a match
            //TODO: should we throw an exception or return false?
        }else{
            //route for that app or type doesn't exist
            //TODO: should we throw an exception or return false?
        }

    }
}
