dojo.provide("desktop.apps.Messenger.widget.AddBuddyForm");
dojo.require("dijit.form.Form");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");

dojo.declare("desktop.apps.Messenger.widget.AddBuddyForm", dijit.form.Form, {
    widgetsInTemplate: true,
    templateString: null,
	strings: "",
    templatePath: dojo.moduleUrl("desktop.apps.Messenger.widget.templates", "AddBuddyForm.html"),
    onSubmit: function(){
    },
    onCancel: function(){
    },
	constructor: function(){
		this.strings = dojo.i18n.getLocalization("desktop.apps.Messenger", "messenger");
	}
});
