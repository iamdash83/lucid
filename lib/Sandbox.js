var fs = require( 'fs' )
  , path = require( 'path' )
  , spawn = require( 'child_process' ).spawn;

var Sandbox = module.exports = function(/*String*/path){
    this._path = path;
    this._process = null;
};


