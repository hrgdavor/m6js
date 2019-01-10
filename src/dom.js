(function(j6x){

/**  &#47;^[A-Za-z]+[\w-_]*&#47; - defines allowed tag names when sent as parameter to find/findAll
@constant tagNameReg
@memberof j6x(core)
*/
j6x.tagNameReg = /^[A-Za-z]+[\w-_]*/;
var h = j6x.h;

j6x.Dom = function Dom(node){ 
	this.el = node; 
	if(!node) throw new Error('Can not create Dom instance for null');
	if(!(node instanceof HTMLElement)) throw new Error('Can not create Dom for non HTMLElement '+node);
}
j6x.DomArr = function DomArr(node){ this.el = node; };
j6x.DomObj = function DomObj(node){ this.el = node; };

j6x.extend(j6x.DomArr, j6x.Dom);
j6x.extend(j6x.DomObj, j6x.DomArr);

var domProto = j6x.Dom.prototype;
var domArrProto = j6x.DomArr.prototype;
var domObjProto = j6x.DomObj.prototype;

domProto.applyToEl = function(func, args, returnValue){
	args[0] = this.el;
	var ret = func.apply(this,args);
	return returnValue ? ret:this;
}

domArrProto.__new = ()=>[];
domArrProto.applyToEl = function(func, args, returnValue){
	for(var p in this.el){
		args[0] = this.el[p];
		func.apply(this, args);
	}
	if(returnValue) throw new Error('You can use functions that return a value only with single node, use .map instead to get object with {key:value,...}');
	else return this;
}

domArrProto.forEach = function(func, thisArg){
	var list = this.el;
	for(var p in list){
		func.call(thisArg||this, list[p], p, list);
	}
};

domArrProto.map = function(func, thisArg){
	var ret = this.__new();
	var list = this.el;
	for(var p in list){
		ret[p] = func.call(thisArg||this, list[p], p, list);
	}
	return ret;
};

domArrProto.filter = function(func, thisArg){
	var ret = this.__new();
	var list = this.el;
	for(var p in list){
		if(func.call(thisArg||this, list[p], p, list)){
			ret[p] = list[p];
		}
	}
	return ret;
};

domArrProto.filter_h = function(func, thisArg){
	return j6x.dom(this.filter(func, thisArg));
};


domObjProto.__new = ()=>({});

j6x.dom = function(node, root){ 

	if(node instanceof String){
		if(root instanceof j6x.Dom) root = root.el;
		node = root.querySelector(node);
	} 

	if(node === null) throw new Error('null node or not found '+node);

	if(node instanceof HTMLElement){
		return new j6x.Dom(node, root); 
	}else if(node instanceof Array){
		return new j6x.DomArr(node, root);
	}
	return new j6x.DomObj(node, root);
}

/** 
Create a html node, and returns a {@link j6x(core).NodeWrapper}. Uses {@link j6x(html).addTag} with same parameters <br>
but returns the created node wrapped with {@link j6x(core).NodeWrapper}.

@function add
@memberof j6x(html)
@see {@link j6x(html).addTag}
*/
j6x.add = function(parent, jsx, nextSibling){
	return new j6x.Dom(j6x.addJsx(parent, jsx, nextSibling));
}

j6x.dom_register = function(name, returnValue, func){

	var staticName = 'h_'+name;
	
	j6x[staticName] = func;

	domProto[name] = function(){
		var newArgs = Array.prototype.slice.call(arguments,0);
		newArgs.unshift(null);
		return this.applyToEl(func,newArgs, returnValue);
	};
}

/** Check if node har a specified attribute defined (regardless of value, null or other)

@instance
@method hasAttr
@memberof mi2JS(core).NodeWrapper
*/
j6x.dom_register('hasAttr', true, function(node, name, val){
	return node.hasAttribute(name);
});


/** get/set attribute on the wrapped node. Setting attribute to null or undefined
will remove the attribute.

@instance
@method attr
@memberof mi2JS(core).NodeWrapper

@param {String} name attribute name
@param {String} value optionaly if sent sets the attribute
*/
j6x.dom_register('attr', false, function(node, name, val){
	if(val === null || val === void 0){
		if(node.hasAttribute(name)){
			node.removeAttribute(name);
		}
	}else{
		if(val !== node.getAttribute(name)){
			node.setAttribute(name,val);
		}
	}
});

/** Get attribute, but return default value if not defined

@instance
@method attrStr
@memberof mi2JS(core).NodeWrapper
@param {string} name attribute name
@param {object} def default value if attribute is not present
*/
j6x.dom_register('attrStr', true, function(node, name, def){
	return node.hasAttribute(name) ? node.getAttribute(name) : def;
});


/** Get attribute, but convert frist using {@link mi2JS(core).num}. Returns 0 when value not a number or
if attribute is not present.

@instance
@method attrNum
@memberof mi2JS(core).NodeWrapper
@param {string} name attribute name
@param {object} def default value if attribute is not present
*/
j6x.dom_register('attrNum', true, function(name, def){
	return j6x.num( this.attrDef(name, def) );
});

/** Boolean from attribute

@instance
@method attrBoolean
@memberof j6x(core).NodeWrapper
@param {string} name attribute name
@param {object} def default value if attribute is not present

@example 
Value is true for all these instances
just defined - <input required> <input required="">
value same as name <input required="required">
value 1,true - <input required="1"> <input required="true">

*/
j6x.dom_register('attrBoolean', true, function(node, name, def){

	if(node.hasAttribute(name)){
		var val = node.getAttribute(name);
		if(val === null || val == '' || val == 'true' || val == name || val == '1') return true;
	}else{
		return def;
	}

	return false;
});


/** Add class to the element if condition is true, and remove if false. 

@function classIf
@instance
@memberof mi2JS(core).NodeWrapper
	@param toAdd - className to add/remove 
	@param condition - (true/false) determines if add/remove is executed. Usualy a result of an expression in the caller code. 
*/
j6x.dom_register('classIf', false, function(node, toAdd, condition){
	if(condition)
		node.classList.add(toAdd);
	else
		node.classList.remove(toAdd);
});

/*** Same as classIf but reversed condition. 
@function classUnless
@instance
@memberof mi2JS(core).NodeWrapper
*/
j6x.dom_register('classIf', false, function(node, toAdd, condition){
	if(condition)
		node.classList.remove(toAdd);
	else
		node.classList.add(toAdd);
});

/** Add a css class to the element. Common function to initiate change defined in css. 
@function addClass
@instance
@memberof mi2JS(core).NodeWrapper
*/
j6x.dom_register('addClass', false, function(node, toAdd){
	node.classList.add(toAdd);
});

/** Check if one of space separated values is in the element's className 
@function hasClass
@instance
@memberof mi2JS(core).NodeWrapper
*/
j6x.dom_register('hasClass', true, function(node, name){
	return node.classList.contains(name);
});

/** Check if node has a class and toggle it
@function hasClass
@instance
@memberof mi2JS(core).NodeWrapper
*/
j6x.dom_register('toggleClass', true, function(node, name){
	return node.classList.toggle(name);
});

/** Remove a css class from the element (leaving others intact) 
@function removeClass
@instance
@memberof mi2JS(core).NodeWrapper
*/
j6x.dom_register('removeClass', true, function(node, toRemove){
	if(node.classList.length)
		return node.classList.remove(toRemove);
});

/*
@function setText
@instance
@memberof mi2JS(core).NodeWrapper
*/
j6x.dom_register('setText', false, function(node, text){
	if(node.textContent !== text) node.textContent = text;
});

/*
@function getText
@instance
@memberof mi2JS(core).NodeWrapper
*/
j6x.dom_register('getText', true, function(node){
	return node.textContent;
});

j6x.hiddenAttribute = 'hidden';
j6x.disabledAttribute = 'disabled';
j6x.selectedAttribute = 'selected';


j6x.dom_register('isVisible', true, function(node){
	return !node.hasAttribute(j6x.hiddenAttribute);
});

j6x.dom_register('setVisible', false, function(node, visible){
	j6x.h_attr(node, j6x.hiddenAttribute, visible ? null:'');
});

j6x.dom_register('isEnabled', true, function(node){
	return !node.hasAttribute(j6x.disabledAttribute);
});

j6x.dom_register('setEnabled', false, function(node, enabled){
	j6x.h_attr(node, j6x.disabledAttribute, enabled ? null:'');
});

j6x.dom_register('isSelected', true, function(node){
	return node.hasAttribute(j6x.selectedAttribute);
});

j6x.dom_register('setSelected', false, function(node, selected){
	j6x.h_attr(node, j6x.selectedAttribute, selected ? '':null);
});

}(j6x));