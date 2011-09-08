define("lucid/widget/core/_ToolbarDropDown", ["dojo", "dijit", "lucid", "dijit.TooltipDialog"], function(dojo, dijit, lucid){
    
    dojo.declare("lucid.widget.core._ToolbarDropDown", [dijit.TooltipDialog], {
        postCreate: function(){
            this.inherited(arguments);
            this._populateDialog();
            this._setupUpdates();
        },
        orient: function(){
            //todo: orient node so it's centered around the button
            this.inherited(arguments);
        },
        _populateDialog: function(){

        },
        _setupUpdates: function(){

        }
    });

    return lucid.widget.core._ToolbarDropDown

});
