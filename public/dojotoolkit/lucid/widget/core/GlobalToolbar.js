define("lucid/widget/core/GlobalToolbar", ["dojo", "dijit", "dijit/_Widget", "dijit/_Container", "dijit/_Templated", "dijit/_HasDropDown", "lucid/widget/core/ContactsDropDown", "lucid/widget/core/EventsDropDown", "lucid/widget/core/UserDropDown"], function(dojo, dijit) {

    dojo.declare("lucid.widget.core.GlobalToolbar", [dijit._Widget, dijit._Templated], {
        
        templateString: dojo.cache("lucid.widget.core", "templates/GlobalToolbar.html"),
        
        widgetsInTemplate: true,

        postCreate: function(){
            this.inherited(arguments);
        }

    });

    dojo.declare("lucid.widget.core.GlobalToolbarDropDownButton", [dijit._Widget, dijit._Templated, dijit._Container, dijit._HasDropDown], {
        templateString: dojo.cache("lucid.widget.core", "templates/DropDownButton.html"),

        label: "",

        _setLabelAttr: function(label){
            this.labelNode.innerHTML = label;
        },

        _fillContent: function(){
            if(this.srcNodeRef){
                this._setLabelAttr(dojo.query("*", this.srcNodeRef)[0].innerHTML);
                
                this.dropDownContainer=this.srcNodeRef; //so we can access srcNodeRef later
            }
        },
        focus: function(){
            this.focusNode.focus();
        },
        startup: function(){
		    if(!this.dropDown && this.dropDownContainer){
    			var dropDownNode = dojo.query("[widgetId]", this.dropDownContainer)[0];
	    		this.dropDown = dijit.byNode(dropDownNode);
		    	delete this.dropDownContainer;
    		}
	    	if(this.dropDown){
		    	dijit.popup.hide(this.dropDown);
    		}
            this.inherited(arguments);
        }
    });
    

    return lucid.widget.core.GlobalToolbar;
});
