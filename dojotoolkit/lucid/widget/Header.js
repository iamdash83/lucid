dojo.provide("lucid.widget.Header");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit._Contained");
dojo.require("dijit.form.DropDownButton");
dojo.require("dijit.Menu");
dojo.require("dijit.TooltipDialog");

dojo.declare("lucid.widget.Header", [dijit._Widget, dijit._Templated, dijit._Contained], {
    templatePath: dojo.moduleUrl("lucid.widget", "templates/Header.html"),
    widgetsInTemplate: true,
    userLabel: "Guest",
    postCreate: function() {
        dojo.subscribe("/user/login", dojo.hitch(this, function(data) {
            console.log('/user/login recieved by header');
            this.attr("userLabel", data);
        }));
        dojo.subscribe("/user/logout", dojo.hitch(this, function(data) {
            console.log('/user/logout recieved by header');
            this.attr("userLabel", false);
        }));  
    },
    _setUserLabelAttr: function(val){
        if(val == false){
            dojo.style(this.userDisplayNode, "display", "none");
            dojo.style(this.guestDisplayNode, "display", "block");
        }else{
            dojo.style(this.userDisplayNode, "display", "block");
            dojo.style(this.guestDisplayNode, "display", "none");
            this.userNode[dojo.isIE ? "innerText" : "textContent"] = val;
        }
    }
});
