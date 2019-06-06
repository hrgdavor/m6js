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

j6x.logError = function(message, e, data, _throw){
    console.log(message || e.message, e, data);
    if(_throw) throw e;
};


/** Uses {@link j6x(core).fixEvent}. Listen for event on an object. Any object that has either 
addEventListener or attachEvent.

@function listen
@memberof j6x(core)
@param {Object} obj object that will generate the event
@param {String} evt event name
@param {Function} fnc callback
@param {Object} self callback function scope ( bind will be performed )
@param {boolean|object} options options parameter for addEventListener
*/
j6x.listen = function ( obj, evt, fnc, self, options ){

    if(typeof(fnc) == 'string') fnc = self[fnc];

    var listener = function(evt){
        fnc.call(self || obj, j6x.fixEvent(evt));
    };

    if (obj.addEventListener){
        var remover = obj.addEventListener(evt,listener,options);
        // DOM nodes addEventListener does not return value, but components return remover function 
        // we can then use that and do not have to create our own
        return remover || function(){obj.removeEventListener(evt,listener,options)};
    }else{
        j6x.logError('object does not have addEventListener ', new Error(), obj);
    }
};

j6x.isComponentNode = function(el){
    return el.getAttribute('as') ? true:false;
}

/** Used by {@link j6x(core).listen}. Do some cleaning on the event object provided by the browser, for easier handling of browser differences.
This is likely more extensive in other libraries. Override it if you need more.

@function fixEvent
@memberof j6x(core)
@param {Event} evt Browser  event
*/
j6x.fixEvent = function(evt){
    evt = evt || window.event;
    evt.stop = function() {
        if(this.preventDefault){ 
            this.preventDefault(); 
            this.stopPropagation(); 
        } else {
            this.returnValue = false;
        }
    };

    evt.target = evt.target || evt.srcElement;
    
    evt.pointerX = function() {
        return this.pageX || (this.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft));
    };
    
    evt.pointerY = function() {
        return this.pageY || (this.clientY + (document.documentElement.scrollTop || document.body.scrollTop));
    };

    return evt;
};


j6x.TRANS = {}
j6x.t = function(code){ return j6x.TRANS[code] || code; }

j6x.h = function(tag,attr, directive){
    // using j6x.TagDef class for security (if needed)
    // user input that looks like tag definition will not pass "instanceof j6x.TagDef" test
    return new j6x.TagDef(tag, attr, directive, Array.prototype.slice.call(arguments,3) );
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

var inputNames = {INPUT:1, SELECT:1, TEXTAREA:1};

j6x.addJsx = function(parentNode, def, before, parentComp ){
    
    var updaters = parentComp ? parentComp._updaters : [];

    // quote from JSX: false, null, undefined, and true are valid children. They simply don’t render
    // ... so to be inline with React JSX: 
    if( (def instanceof Boolean) || def === void 0 || def === null || def === '' ) return;

    if(def instanceof Function){

        if(def.prototype instanceof j6x.comp.Base){
            j6x.addComp(parentNode, def, null, before, parentComp );
            
        }else{
            var tmp = new j6x.NodeUpdater(def);
            def.init(parentNode, before);
            updaters.push(tmp);
        }
        

    } else if(def instanceof j6x.NodeUpdater){

        def.init(parentNode, before);
        updaters.push(def);

    } else if(def instanceof Array){
        def.forEach(function (c) { 
            j6x.addJsx(parentNode, c, before, parentComp  );
        });

    } else if(def instanceof j6x.TagDef){
        
        if(def.tag == 'template' || def.tag == 'frag'){
            def.children.forEach(function (c) {
                j6x.addJsx(parentNode, c, before, parentComp );
            });        
        
        }else{
            if(typeof(def.tag) == 'string' && inputNames[def.tag.toUpperCase()]){
                if(!def.attr) def.attr = {};
                if(!def.attr.as) def.attr.as = 'base.Input';
            }
            if(def.tag.prototype instanceof j6x.comp.Base || (def.attr && def.attr.as)){
                comp = j6x.addComp(parentNode, def, before, parentComp );
            }else{            
                
                var n = document.createElement(def.tag);
                
                if(parentComp) parentComp.initNodeAttr(n, def.attr, def.directive);
                
                j6x.insertAttr(n,def.attr, updaters);

                if(parentNode) parentNode.insertBefore(n, before);
                
                if (def.children && def.children.length) {
                    j6x.addJsx(n, def.children, null, parentComp );
                }
                return n;
            }
        }
    }else{
        // TODO join text node updating and value handling
        if(typeof(def) != 'string') def = ''+def;

        var n = document.createTextNode(def);
        if(parentNode) parentNode.insertBefore(n, before);
        return n;
    }
    // set attributes immediately if there is no parentNode component to handle the task
    if(!parentComp){
        updaters.forEach(function(u){u.update();});
    }
}

j6x.domEvents = {
    abort:1,
    afterprint:1,
    animationend:1,
    animationiteration:1,
    animationstart:1,
    beforeprint:1,
    beforeunload:1,
    blur:1,
    canplay:1,
    canplaythrough:1,
    change:1,
    click:1,
    contextmenu:1,
    copy:1,
    cut:1,
    dblclick:1,
    drag:1,
    dragend:1,
    dragenter:1,
    dragleave:1,
    dragover:1,
    dragstart:1,
    drop:1,
    durationchange:1,
    ended:1,
    error:1,
    focus:1,
    focusin:1,
    focusout:1,
    fullscreenchange:1,
    fullscreenerror:1,
    hashchange:1,
    input:1,
    invalid:1,
    keydown:1,
    keypress:1,
    keyup:1,
    load:1,
    loadeddata:1,
    loadedmetadata:1,
    loadstart:1,
    message:1,
    mousedown:1,
    mouseenter:1,
    mouseleave:1,
    mousemove:1,
    mouseover:1,
    mouseout:1,
    mouseup:1,
    offline:1,
    online:1,
    open:1,
    pagehide:1,
    pageshow:1,
    paste:1,
    pause:1,
    play:1,
    playing:1,
    popstate:1,
    progress:1,
    ratechange:1,
    resize:1,
    reset:1,
    scroll:1,
    search:1,
    seeked:1,
    seeking:1,
    select:1,
    show:1,
    stalled:1,
    storage:1,
    submit:1,
    suspend:1,
    timeupdate:1,
    toggle:1,
    touchcancel:1,
    touchend:1,
    touchmove:1,
    touchstart:1,
    transitionend:1,
    unload:1,
    volumechange:1,
    waiting:1,
    wheel:1
};

}());