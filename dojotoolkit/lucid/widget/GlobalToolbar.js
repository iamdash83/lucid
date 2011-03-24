define("lucid/widget/GlobalToolbar", ["dojo", "dijit", "dijit/_Widget", "dijit/_Templated"], function(dojo, dijit) {

    dojo.declare("lucid.widget.GlobalToolbar", [dijit._Widget, dijit._Templated], {
        templatePath: dojo.moduleUrl("lucid.widget", "templates/GlobalToolbar.html")
    });

    return lucid.widget.GlobalToolbar;
});
