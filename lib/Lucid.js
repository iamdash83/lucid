var Config = require("./Config");
var ComponentManager = require("./component/Manager");
var AppManager = require("./app/Manager");

var Lucid = module.exports = function(settings){
    this.settings = settings;
    this.config = new Config(settings.config);
    this.componentManager = null;

    var self = this;
    this.config.load().then(function(){

        self._bootstrap();

    }, function(error){
        //TODO: better way of logging
        console.log("Error reading config file: "+error);
    });
}


Lucid.prototype._bootstrap = function(){
    //create the component manager
    var cmArgs = this.config.get("components");
    cmArgs.arguments = this.config.get("options");
    cmArgs.environment = this.settings;
    var cm = this.componentManager = new ComponentManager(cmArgs);

    var self = this;
    cm.once("ready", function(){

        var amOptions = self.config.get("applications");
        var am = self.appManager = new AppManager(amOptions, self.settings.rootPath, cm);
        am.start(["*"]);

        //done!
    });
}

