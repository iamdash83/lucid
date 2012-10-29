var fs = require("fs");

var ComponentLoader = module.exports = function(options){
    this._options = options;
}

ComponentLoader.prototype._getComponentList = function(cb){
    var self = this;
    var path = this._options.path;
    fs.readdir(path, function(err, files){
        if(err) throw new Error("Couldn't read components directory '"+path+"': "+err.message);
        //do some additional processing on the list and return it
        cb(self._filterComponents(files));
    })
}

ComponentLoader.prototype._filterComponents = function(list){
    var self = this;
    var options = this._options;
    var filteredList = [];

    //add items from whitelist
    options.whitelist.forEach(function(pattern){
        list.forEach(function(component){
            if(self._isMatch(component, pattern))
                filteredList.push(component);
        });
    });
    
    //remove items from blacklist
    options.blacklist.forEach(function(pattern){
        for(var i in filteredList)
            if(self._isMatch(filteredList[i], pattern))
                filteredList.splice(i, 1);
    });

    return filteredList;
}

ComponentLoader.prototype._isMatch = function(string, pattern){
    if(pattern.indexOf("*") != -1){
        var re = new Regexp(pattern);
        return re.test(string);
    }else{
        return string == pattern;
    }
}

ComponentLoader.prototype.loadComponents = function(list){
    //here we do the heavy lifting and figure out what order to load components in based on their dependencies
    var manifests = this._loadManifests(list);

    var loadOrder = this._getComponentLoadOrder(list, manifests);
    var components = {};
    var self = this;
    loadOrder.forEach(function(compName){
        components[compName] = self._constructComponent(compName);
    });

    return components;
}

ComponentLoader.prototype._constructComponent = function(name){
    return {}; //TODO
}

ComponentLoader.prototype._getComponentLoadOrder = function(list, manifests){
    //quickly check to make sure we can satisfy all dependencies (no dependencies on non-existant components)
    list.forEach(function(i){
        manifests[i].depends.forEach(function(j){
            if(!manifests[j]){
                throw new Error("Component '"+i+"' depends on component '"+j+"', but we couldn't find it! Maybe it was blacklisted or excluded from the whitelist?");
            }
        });
    });


    var loadOrder = [];

    //do topological sorting of the components so we know our load order

    //gather a non-distinct list of components required by other components
    var requiredComponents = [];
    for(var c in manifests){
        requiredComponents = requiredComponents.concat(manifests[c].depends);
    }
    //now remove any of these from `list` so we're left with orphan components
    //that aren't required by anything
    requiredComponents.forEach(function(c){
        var index = list.indexOf(c);
        if(index != -1)
            list.splice(index, 1);
    });

    //finally, we use an algorithm from wikipedia to sort topologically.
    //note that this will cause a crash if there's a cyclical dependency.
    var visitedComponents = {};
    var visit = function(n){
        if(!visitedComponents[n]){
            visitedComponents[n] = true;
            manifests[n].depends.forEach(visit);
            loadOrder.unshift(n);
        }
    };
    list.forEach(visit);

    return loadOrder;
}

ComponentLoader.prototype._loadManifests = function(list){
    var path = this._options.path;
    var manifests = {};
    list.forEach(function(component){
        manifests[component] = require(path+"/"+component+"/manifest");
    });
    return manifests;
}
