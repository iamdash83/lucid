dojo.provide("desktop.apps.KatanaIDE");
dojo.require("dijit.layout.SplitContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.Tree");
dojo.require("dijit.form.Textarea");
dojo.require("dijit.form.Button");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.Toolbar");
dojo.require("dijit.Dialog");
dojo.require("dijit.Menu");
dojo.require("dijit.form.FilteringSelect");
dojo.require("dojo.data.ItemFileWriteStore");
dojo.requireLocalization("desktop", "common");
dojo.requireLocalization("desktop", "apps");
dojo.requireLocalization("desktop.ui", "menus");
dojo.requireLocalization("desktop", "system");
dojo.requireLocalization("desktop.widget", "filearea");
dojo.requireLocalization("desktop.apps.KatanaIDE", "ide");

dojo.require("desktop.apps.KatanaIDE._base");
dojo.require("desktop.apps.KatanaIDE.CodeTextArea");
dojo.require("desktop.apps.KatanaIDE.EditorLite");
desktop.addDojoCss("desktop/apps/KatanaIDE/codeEditor.css");
