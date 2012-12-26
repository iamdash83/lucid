var fs = require("fs");

var moduleSelector = module.exports = {
    getCandidates: function(path, type, cb){
        fs.readdir(path, function(err, files){
            if(err) throw new Error("Couldn't read "+type+" directory '"+path+"': "+err.message);
            //TODO: restrict to only files that are directories
            cb(files);
        })
    },
    applyFiltering: function(candidates, whitelist, blacklist){
        var self = this;
        var filteredList = [];

        if(!whitelist) whitelist = ["*"];
        if(!blacklist) blacklist = [];
        
        //add items from whitelist
        whitelist.forEach(function(pattern){
            candidates.forEach(function(component){
                if(self._isMatch(component, pattern))
                    filteredList.push(component);
            });
        });
        
        //remove items from blacklist
        blacklist.forEach(function(pattern){
            for(var i in filteredList)
                if(self._isMatch(filteredList[i], pattern))
                    filteredList.splice(i, 1);
        });

        return filteredList;
    },
    _isMatch: function(string, pattern){
        if(pattern.indexOf("*") != -1){
            var re = new RegExp(pattern.replace("*", "(.*)"));
            return re.test(string);
        }else{
            return string == pattern;
        }
    }
};
