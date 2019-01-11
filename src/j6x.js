(function(){
/** 
@namespace j6x(core)

*/

/** 
Defines properties needed to extract single element template from a a node,
or to programatically define such template.

    @typedef ElementTemplate
    @type {object}
    @property {string} tag - tag name
    @property {Object} attr - object containing key->value pairs for attributes
    @property {string} html - innerHTML of the element
 */


/** Very basic wrapper used for scripting(similar to JQuery and alike). Contains some useful
     methods to allow manipulation, and can be extended further if needed. For more advanced 
     functionalities check {@link j6x.comp..Base} component and it's descendants in {@link j6x.comp.}.
@class NodeWrapper
@memberof j6x(core)
*/
var j6x = window.j6x = window.j6x || {};


/** 
<p><b>utility for classes </b> - 
Extends destination class with source class.
</p>
<p><i>
Taken over from Oliver Caldwell's blog:    Prototypical inheritance done right<br>
{@link http://oli.me.uk/2013/06/01/prototypical-inheritance-done-right/}
</i></p>

@function extend
@memberof j6x(core)
 
@param {class} destination The class that should be inheriting things.
@param {class} source The parent class that should be inherited from.
@return {object} The prototype of the parent.
    
 */
j6x.extend = function(destination, source) {
    const srcProto = source.prototype;
    const destProto = destination.prototype = Object.create(srcProto);
    destProto.constructor = destination;
    destination.superClass = srcProto;
    return srcProto;
};


/** Parse number using parseFloat, but return zero if not a number.

@function num
@memberof j6x(core)

@param obj - string or anything else (if parseFloat fails, zero is returned)
*/
j6x.num = function(str){
    var n = parseFloat(str);
    return isNaN(n) ? 0:n;
};

j6x.TRANS = {}
j6x.t = function(code){ return j6x.TRANS[code] || code; }

j6x.h = function(tag,attr, directive){
    // using j6x.TagDef class for security (if needed)
    // user input that looks like tag definition will not pass "instanceof j6x.TagDef" test
    return new j6x.TagDef(tag, attr, directive, Array.prototype.slice.call(arguments,2) );
}


j6x.TagDef = function(tag, attr, directive, children){
    this.tag = tag;
    this.attr = attr;
    this.directive = directive;
    this.children = children || [];
}

j6x.NodeUpdater = class NodeUpdater{

    constructor(func){
        this.el = el;
        this.attr = attr;
        this.func = func;
    }

    update(){
        var newValue;
        var val = newValue = this.func();
        // TODO perform vdiff here
        // quote from JSX: false, null, undefined, and true are valid children. They simply don’t render
        // .. so to be somewhat inline with React JSX we will keep the TextNode, it will just be '' in those cases
        if(newValue instanceof Boolean || newValue === void 0 || newValue === null ) newValue = '';

        // TODO VDIFF 
        if(typeof(newValue) != 'string') newValue = ''+newValue;
        
        if(this.el.textContent != newValue) this.el.textContent = newValue;

        return val;
    }

    init(parent, before){ 
        this.el = document.createTextNode(''); 
        parent.insertBefore(this.el, before);
        return this.el;
    }
}

j6x.AttrUpdater = class AttrUpdater{
    
    constructor(el, attr, func){
        this.el = el;
        this.attr = attr;
        this.func = func;
    }

    init(){}

    update(){
        var newValue = func();
        if(node.getAttribute(attr) != newValue){
            if(newValue === false)
                node.removeAttribute(attr);
            else
                node.setAttribute(attr, newValue);             
        }
        return newValue;
    }
}

j6x.insertAttr = function(n, def_attr, directive, updaters){
    for (var a in def_attr) {
        var value = def_attr[a];
        if(value && (value instanceof Function)){
            // preapre updater for attribute value
            updaters.push(new j6x.AttrUpdater(n, a, value));
        }else{
            n.setAttribute(a, value);
        }
    }
};

j6x.addJsx = function(parent, def, before, updaters, parentComp){
    
    updaters = updaters || [];
    // quote from JSX: false, null, undefined, and true are valid children. They simply don’t render
    // ... so to be inline with React JSX: 
    if( (def instanceof Boolean) || def === void 0 || def === null || def === '' ) return;

    if(def instanceof Function){
        var tmp = new j6x.NodeUpdater(def);
        def.init(parent, before);
        updaters.push(tmp);

    } else if(def instanceof j6x.NodeUpdater){
        def.init(parent, before);
        updaters.push(def);

    } else if(def instanceof Array){
        def.forEach(function (c) { 
            j6x.addJsx(parent, c, before, updaters);
        });

    } else if(def instanceof j6x.TagDef){
        
        if(def.tag == 'template' || def.tag == 'frag'){
            def.children.forEach(function (c) { 
                j6x.addJsx(parent, c, before, updaters);
            });        
        
        }else{
            var n = document.createElement(def.tag);
            if (def.attr) {
                if(parentComp) parentComp.initNodeAttr(n,def.attr, directive);
                j6x.insertAttr(n,def.attr, updaters);
            }
            if(parent) parent.insertBefore(n, before);
            if (def.children && def.children.length) {
                j6x.addJsx(n, def.children, null, updaters, parentComp);
            }
            return n;
        }
    }else{
        // TODO join text node updating and value handling
        if(typeof(def) != 'string') def = ''+def;

        var n = document.createTextNode(def);
        if(parent) parent.insertBefore(n, before);
        return n;
    }
    // set attributes immediately if there is no parent component to handle the task
    if(!parentComp){
        updaters.forEach(function(u){u.update();});
    }
}

}());