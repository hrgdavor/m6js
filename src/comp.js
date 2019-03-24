(function(j6x){

/**
@namespace j6x(comp)
*/

// if the script is loaded again, it will reuse existing j6x.compData
var compData = j6x.comp = j6x.comp || {__later:{}, __counterSeq:0};
var compDataLater = j6x.comp.__later;
var j6Proto = j6x.prototype;

/**
@function addCompClass
@memberof j6x(comp)
*/
j6x.addCompClass = function(name, supName, initializer){
	if(compData[name] || compDataLater[name]) console.error('Component with same name already defined '+name);
	if(typeof initializer != 'function') throw new Error('Initializer not a function');
	compDataLater[name]  = function(){ return j6x.initComp(name, supName, initializer); };
};

/**
@function initComp
@memberof j6x(comp)
*/
j6x.initComp = function(name, supName, initializer){
	var comp = compData[name];

	var superClass = name == 'Base' ? j6x.Dom:this.getComp(supName || 'Base');
	if(!comp){
		comp = eval('(function '+name.replace(/[\.\/]/g,'_')+'(){})');
		comp.superClass = superClass;
		j6x.extend( comp, superClass );
	}
	// else: 
	// hapens when reloading component in runtime
	// changes to the component prototype can be applied to the already instantiated components
	initializer(j6x.h, j6x.t, comp.prototype, superClass.prototype, comp, superClass);
	comp.compName = name;

	var nameArr = name.split('.');
    function add(obj,idx){
        if(idx < nameArr.length -1){
            if(!obj[nameArr[idx]]) obj[nameArr[idx]] = {};
            add(obj[nameArr[idx]], idx+1); 
        }else{
            obj[nameArr[idx]] = comp;
        }
    }
    if(nameArr.length > 1) add(compData, 0);


	return (compData[name] = comp);
};

/**
@function checkComp
@memberof j6x(comp)
*/
j6x.checkComp = function(name){ return compData[name] || compDataLater[name]; }

/**
@function getComp
@memberof j6x(comp)
*/
j6x.getComp = function(name){ 
	var compDef = compData[name];
	if(!compDef && compDataLater[name]){
		// initialize the parent component by calling the function in compDataLater
		compDef = compDataLater[name]();
		delete compDataLater[name];
	}
	if(!compDef) {
		var msg = 'Component not found: '+name;
		var e = new Error(msg);
		j6x.logError(msg, e);
		throw e;
	}
	return compDef; 
};

/** 
@namespace j6x(comp)

@function makeComp
@memberof j6x(comp)
*/
j6x.addComp = function(parentNode, jsx, before, parent){
	try{

		// jsx.tag is either tagName or reference to component class
		var tagName = jsx.tag;
		var compDef = tagName;

		var attr = jsx.attr;
		var directive = jsx.directive;

		// component name is in the attributes
		if(typeof(tagName) == 'string'){
			// if component name is not specified, 'Base' is used
			var compName =  'Base';
			if(attr && attr.as) compName = attr.as;

			compDef = this.getComp(compName);
		}else{
			// since in this case jsx.tag is a component class reference
			// we need to give tagName a valid default value
			tagName = 'DIV';
		}

		var newComp = new compDef();
		newComp._jsxChildren = jsx.children;

		// we do not have a classic constructor available to override, so components
		// have this method as replacement if needed ot initialize anything early
		newComp.construct();

		// root component does not have a parent
		if(parent){
			newComp.setParent(parent);
			parent.initChildAttr(newComp, attr, directive)
		}
		// allow component to
		newComp.initAttr(attr, directive );

		// component is given chance to provide the tagName
		var el = document.createElement(newComp.tagName() || tagName);

		if(parentNode) parentNode.insertBefore(el, before);

		// allow component to save reference to the DOM node, and also 
		newComp.attach(el);
		
		newComp.applyAttr(attr, directive);

		newComp.fireEvent('create');

		if(newComp.isVisible()){
			newComp.fireEvent('show');
		}

		return newComp;

	}catch(e){
		// log the component and the node where the error happened
		// this will occur for each parent too as the error is rethrown
		// and error will show up in console for inspection of execution stack
		j6x.logError('error while creating a component '+compName, e, {el, parent}, 1);
	}
};

/** 
p       access by
value        calling
--------------------------
info      |  obj.info
img.      |  obj.img[0]
img.      |  obj.img[1]
bt.edit   |  obj.bt.edit
bt.save   |  obj.bt.save

@function setRef
@memberof j6x(core)
*/
j6x.setRef = function(obj, comp, prop){
	if(!prop) return;

	var idx = -1;
	if(prop){
		if( (idx=prop.indexOf('.')) != -1){
			var group = prop.substring(0,idx);
			prop = prop.substring(idx+1);
			comp.__propGroup = group;
			if(prop){
				//example: p="bt.edit"
				if(!obj[group]){
					obj[group] = {};
					obj['$'+group] = new j6x.NWGroup(obj[group]);
				} 
				comp.__propName  = prop;
                if(obj[group][prop]) logPropTaken(group+'.'+prop, obj, obj[group][prop]);
                obj[group][prop] = comp;
            }else{
                //example: p="bt."
				if(!obj[group]){
					obj[group] = [];
					obj['$'+group] = new j6x.NWGroup(obj[group]);
				} 
                comp.__propName = obj[group].length;
				obj[group].push(comp);
			}
		}else{
			//example p="edit"
            if(obj[prop]) logPropTaken(prop, obj, obj[prop]);
			comp.__propName = prop;
			obj[prop] = comp;
		}
	}
};

var _dirtyComps = new Set();
var _dirtyCompsTimer = null;

function dirtyCompRunner(comp){
	for(var comp of _dirtyComps){
		try{
			comp.runUpdaters();
		}catch (e){
			j6x.logError('Unable to run updater', e, {comp});
		}
	}
	_dirtyComps.clear();
	_dirtyCompsTimer = null;
}

/** Add component to the set. In next animation frame, all components from
the set will be updated (method runUpdaters() will be called).
@namespace j6x(comp)

@function markDirtyComp
@memberof j6x(comp)
*/
j6x.markDirtyComp = function(comp){
	j6x._dirtyComps.add(comp);
	if(!_dirtyCompsTimer) _dirtyCompsTimer = requestAnimationFrame(dirtyCompRunner);
};


}(j6x));
