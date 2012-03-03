(function(){
    var _require = require;
    require = function(){
        //TODO: actually filter input
        _require.call(this, arguments);
    }
})();


