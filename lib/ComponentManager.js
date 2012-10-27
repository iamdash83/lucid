var _ = require("underscore/underscore");

var option_defaults = {
    componentPath: __dirname+"components/",
    modules: ["*"],
    blacklist: []
};

var ComponentManager = module.exports = function(options){
    this._options = _.defaults(option_defaults, options);
}
