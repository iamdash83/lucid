
var Base = module.exports = function(componentManager, options, environment){
    this.dispatcher = null;
    this._environment = environment;
    this._options = options;
    this._componentManager = componentManager;
}
