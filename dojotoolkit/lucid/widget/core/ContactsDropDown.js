define("lucid/widget/core/ContactsDropDown", ["dojo", "dijit", "lucid", "dijit/_Widget", "dijit/_Templated"], function(dojo, dijit, lucid){
    
    dojo.declare("lucid.widget.core.ContactsDropDown", [dijit._Widget, dijit._Templated], {
         
        templateString: dojo.cache("lucid.widget.core", "templates/DropDown.html"),

        postCreate: function(){
            this.inherited(arguments);
        },
        focus: function(){
            this.domNode.focus();
        },
        onExecute: function(){
            
        },
        onCancel: function(){
            
        }
    });

});
