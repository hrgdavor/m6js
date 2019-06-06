(function(j6x){

/**
@class NGroup
@memberof j6xJS(core)
*/
	var NGroup = j6x.NGroup = function NGroup(group){

		// better we fix the case when called without "new" operator than confusing developer with err later
		if(!(this instanceof NGroup)) return new NGroup(group);

		this.items = group || this;
	}

	var proto = NGroup.prototype;

	function makeMap(arr, val){
		var obj = {};
		if(typeof arr == 'string'){
            obj[arr] = val;
        }else if(arr instanceof Array || arr.length){
        	// if came from single argument array parameter like: visibleIs(['a','b']);
        	if(arr.length == 1 && arr[0] instanceof Array ) arr = arr[0]; 
            for(var i=0; i<arr.length; i++){
                obj[arr[i]] = val;
            }          
		}else{
			return arr; // already a map
		}
		return obj;
	}

/** 
Call func on all items 

@method callFunc
@instance
@memberof j6xJS(core).NGroup
*/
	proto.callFunc = function(funcName, params){
		var func;
		for(var p in this.items){
			func = this.items[p][funcName];
			if(func) func.apply(this.items[p],params);
		}
	};

/** 

@method item
@instance
@memberof j6xJS(core).NGroup
*/
	proto.item = function(code){
		if(code && code.tagName){
			var ret;
			this.forEach(function(item){
				if(item.el == code) ret = item;
			});
			return ret;
		}
		return this.items[code];
	};

/** 
call function on each element 

@method forEach
@instance
@memberof j6xJS(core).NGroup
*/
	proto.forEach = function(func, params){
		var items = this.items;
		for(var p in items){
			func(items[p], p, items, params);
		}
	}

/** 

@method firstResult
@instance
@memberof j6xJS(core).NGroup
*/
    proto.firstResult = function(func, params){
        var items = this.items;
        for(var p in items){
            var ret = func(items[p], p, items, params);
            if(ret !== void 0) return ret;
        }
    }

/** 

@method forEachGet
@instance
@memberof j6xJS(core).NGroup
*/
	proto.forEachGet = function(func, params){
		return this.items instanceof Array ? 
			this.forEachGetArray(func, params) : this.forEachGetObject(func, params);
	};

/** 
call function on each element, but collect returned values as array

@method forEachGetArray
@instance
@memberof j6xJS(core).NGroup
*/
	proto.forEachGetArray = function(func, params){
		var items = this.items;
		var ret = [], fromFunc;
		for(var p in items){
			fromFunc = func(items[p],p,items, params);
			if(fromFunc !== void 0) ret.push(fromFunc);
		}
		return ret;
	}

/** 
call function on each element, but collect returned values as object

@method forEachGetObject
@instance
@memberof j6xJS(core).NGroup
*/
	proto.forEachGetObject = function(func, params){
		var items = this.items;
		var ret = {}, fromFunc;
		for(var p in items){
			fromFunc = func(items[p],p,items, params);
			if(fromFunc !== void 0) ret[p] = fromFunc;
		}
		return ret;
	}



/* ************************************************************************************************** */

	proto.focus = function(){
		var item, toFocus;
		for(var p in this.items){
			item = this.items[p];
			if( ( !toFocus || item.hasAttr('firstInput') )
					&& item.focus 
					&& !(item.isReadOnly && item.isReadOnly()) ){

				toFocus = item;
			}
		}
		if(toFocus) toFocus.focus();
	};
	
	proto.setReadOnly = function(readOnly){
		this.callFunc('setReadOnly',[readOnly]);
	};

	proto.setConfig = function(){
		this.callFunc('setConfig',arguments);
	};

	proto.setValue = function(value){
		value = value || {};
		for(var p in this.items){
			this.items[p].setValue(value[p]);
		}
	};

    proto.validate = function(){
        var validator = this.getValidator();
        var result = validator.validate(this.getRawValue());
        this.markValidate(result);
        return result;
    };

	proto.getValidator = function(){
		var defReq = this.required;
		var rules = this.forEachGetObject(function(item,code){
			return j6x.getValidator(item, defReq);
		});
		return new j6x.GroupValidator(rules, defReq);
	}

	proto.markValidate = function(data){
		data = data || new j6x.GroupValidity({});
		if(data.item && data.item instanceof Function){
            this.forEach(function(item,p){
    			if(item.markValidate)
    				item.markValidate(data.item(p));
    			else
    				j6x.markValidate(item, data.item(p));			
    		});            
        }else{
            console.error('GroupValidity expected');
            console.log('Validity provided', data, 'for',this);
        }
	};

	proto.getValue = function(){
		var value = {};
		for(var p in this.items){
			value[p] = this.items[p].getValue();
		}
		return value;
	};

    proto.getRawValue = function(){
        var value = {}, item;
        for(var p in this.items){
            item = this.items[p];
            value[p] = item.getRawValue ? item.getRawValue() : item.getValue();
        }
        return value;
    };


/* ************************************************************************************************** */

	/* Toggle functionalities EXPERIMENTAL */

	/* this is usefull to add a group of elements, so they can be changed together */
	proto.visibleIs  = function(){ this.toggleParams('setVisible',  arguments, [true], [false]); };
	proto.selectedIs = function(){ this.toggleParams('setSelected', arguments, [true], [false]); };
	proto.enabledIs  = function(){ this.toggleParams('setEnabled',  arguments, [true], [false]); };

	proto.visibleNot  = function(){ this.toggleParams('setVisible',  arguments, [false], [true]); };
	proto.selectedNot = function(){ this.toggleParams('setSelected', arguments, [false], [true]); };
	proto.enabledNot  = function(){ this.toggleParams('setEnabled',  arguments, [false], [true]); };

	proto.toggleClass = function(className){
		this.toggleCall(
			Array.prototype.slice.call(arguments, 1),
			function(item){
				item.classIf(className, true);
			},
			function(item){
				item.classIf(className, false);
			}
		); 
	};

	proto.toggleAttr = function(name, on, off){
		this.toggleCall(
			Array.prototype.slice.call(arguments, 3),
			function(item){
				item.attr(name, on);
			},
			function(item){
				item.attr(name, off);
			}
		); 
	};

	proto.toggleParams = function(funcName, arr, on, off){
		var what = makeMap(arr, true), items = this.items, params, item;
		for(var p in items){
			params = what.hasOwnProperty(p) ? on : off;
			item = items[p];
			item[funcName].apply( item, params );
		}
	};

    proto.callForSome = function(arr, func, args){
        var what = makeMap(arr, true), items = this.items;
        for(var p in items){
            if(what.hasOwnProperty(p)) 
                items[p][func].apply(items[p], args);
        }
    };

	proto.toggleCall = function(arr, onFunc, offFunc){
		var what = makeMap(arr, true), func, items = this.items;

		for(var p in items){
			func = what.hasOwnProperty(p) ? onFunc : offFunc;
			func(items[p],p,items);
		}
	};


    proto.forSome = function(arr, func){
        var what = makeMap(arr, true), items = this.items;
        for(var p in items){
            if(what.hasOwnProperty(p)) 
                func(items[p],p,items);
        }
    };


}(j6x));
