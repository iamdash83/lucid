define("lucid/widget/core/GlobalToolbar", ["dojo", "dijit", "dijit/_Widget", "dijit/_Templated", "dijit/form/Button", "lucid/widget/core/ContactsDropDown"], function(dojo, dijit) {

    dojo.declare("lucid.widget.core.GlobalToolbar", [dijit._Widget, dijit._Templated], {
        
        templateString: dojo.cache("lucid.widget.core", "templates/GlobalToolbar.html"),

        postCreate: function(){
            this.inherited(arguments);
        }
    });

    return lucid.widget.core.GlobalToolbar;
});
