(function(j6x){
j6x.directives = { };

j6x.registerDirective = function(name, dir){
    var nameArr = name.split('-');

    function add(obj,idx){
        if(idx < nameArr.length -1){
            if(!obj[nameArr[idx]]) obj[nameArr[idx]] = {};
            add(obj[nameArr[idx]], idx+1); 
        }else{
            obj[nameArr[idx]] = dir;
        }
    }
    add(j6x.directives, 0);
}

j6x.runAttrDirective = function(el, comp, options, updaters, parentComp, src=j6x.directives, prefix=''){
    if(!options) return;
    for(var p in options){
        if(src[p]){
            var func = src[p];
            if(func) func(el, comp, options[p], updaters, parentComp, options);
        }else{
            // restore the attribute value if no directive present
            var attName = prefix+p;
            var val = options[p]._;
            if(val && val instanceof Function){
                updaters.push(new j6x.AttrUpdater(el, attName, val));
            }else{
                j6x.h_attr(el,attName,val);
            }
        }
    }
};

j6x.registerDirective('x', function(el, comp, options, updaters, parentComp){
    if(!options) return;
    j6x.runAttrDirective(el, comp, options, updaters, parentComp, j6x.directives.x, 'x-');
});


}(j6x));