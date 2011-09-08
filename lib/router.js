exports = {
    //  summary:
    //      URL Routing class. Supports live loading and unloading
    //      of URL routes and such.


    //  _routes: Object
    //      A list of routes to resolve.
    //      The URL resolver will hit this. The default route list will have
    //      some stuff in there so the app resolver will be called if
    //      the URL pattern matches an app's. So basically this is
    //      only really going to hold URL patterns for Lucid itself.
    _routes: {},

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
        //      
    }
}
