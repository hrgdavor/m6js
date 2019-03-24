(function(){

    j6x.cleanDataForJson = function(data, level){
        if(level === void 0) level = 100;
        if(!data) return data;
        if(level === 0) return data.toString();
        if(data instanceof Array){
            var tmp = [];
            for(var i=0; i<data.length; i++) { tmp.push(j6x.cleanDataForJson(data[i], level-1)); }
            return tmp;
        }

        if(data instanceof mi2){
            var ret = { elem: tagAttrs(data.el) };
            var parents = [];
            var parent = data.el.parentNode;
            while(parent && parents.length < 4 && parent != document.body){
                parents.push(parent);
                parent = parent.parentNode;
            }
            ret.parents = '';
            for(var i=parents.length-1; i>=0; i--) ret.parents += tagAttrs(parents[i]);
            if(data instanceof Base){
                ret.comp = data.el.getAttribute('as');
                ret.state = j6x.cleanDataForJson(ret.state, level-1);
            }
            return ret;
        }
        if(data instanceof Element){
            return tagAttrs(data);
        }

        if(typeof data == 'string'){
            return data;
        }
        if(typeof data == 'object'){
            if(data.preventDefault) return data.toString();
            var tmp = {};
            for(var i in data){ 
                if(skipFields[i]) continue;
                tmp[i] = j6x.cleanDataForJson(data[i], level-1);
            }
            return tmp;
        }
        return data.toString();
    }

    function destroyCircular(from, seen){
        var to = Array.isArray(from) ? [] : {};

        seen.push(from);

        // TODO: Use `Object.entries() when targeting Node.js 8
        var keys = Object.keys(from);
        for (var p in keys) {
            var key = keys[p];
            var value = from[key];

            if (typeof value === 'function') {
                continue;
            }

            if (!value || typeof value !== 'object') {
                to[key] = value;
                continue;
            }

            if (!seen.includes(from[key])) {
                to[key] = destroyCircular(from[key], seen.slice());
                continue;
            }

            to[key] = '[Circular]';
        }

        var commonProperties = {name:1, message:1, stack:1, code:1};

        for (var property in commonProperties) {
            if (typeof from[property] === 'string') {
                to[property] = from[property];
            }
        }

        return to;
    };


    j6x.serializeError = function(value){
        if (typeof value === 'object') {
            return destroyCircular(value, []);
        }

        // People sometimes throw things besides Error objects…
        if (typeof value === 'function') {
            // JSON.stringify discards functions. We do too, unless a function is thrown directly.
            return '[Function: '+(value.name || 'anonymous')+']';
        }

        return value;
    };

}(j6x));