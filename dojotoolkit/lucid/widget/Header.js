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
    postCreate: function() {
        dojo.subscribe("/user/login", dojo.hitch(this, function(data) {
            alert('/user/login recieved by header');
            this.userNode.innerHTML = data;
        }));
        dojo.subscribe("/user/logout", dojo.hitch(this, function(data) {
            alert('/user/logout recieved by header');
            this.userNode.innerHTML = "Guest";
        }));  
    }
});
