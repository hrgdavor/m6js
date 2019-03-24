j6x.addCompClass('Base', '',

/** 
<p>Event object used for firing events inside components</p>
<p><b>src and target are added automatically, you can not pass them to fireEvent</b></p>
<p>If you listen to 'submit' event on a Form, src will be the input that originated the 'submit' event
and target will be the Form</p>

  @typedef EventObject
  @type {object}
  @property {string} name - event name
  @property {string} fireTo - direction of the event (undefined|parent|children)
  @property {Object} src - source/origin component where of the event
  @property {Object} target - target component the event is firing from right now
  @property {Event} domEvent - (optional) should be passed when DOM Event was the cause
 */



/** <b>Extends:</b> {@link j6x(core).Dom}<br>
Base class for all components. Goes beyond simple {@link Dom} to add parent/child/children
relationship. Also adding other functionalities needed for component based composition of an application.

@class Base
@memberof j6x(comp)

*/

function(h,t,proto, superProto, comp, superClass){
	var base = j6x.base;
	proto.mainClass = '';
	proto.state = {

	};

	/* called when the component is initially constructed
	@instance
	@function construct 
	@memberof j6x(comp).Base
	@param {Element} el
	@param {object} parent
	*/
	proto.construct = function(el){
		this.state = {};
		this.params = {};
		this.children = [];
		this._updaters = [];
		this.__listeners = {};
		this._listenerRemovers = [];
	};

	/** 
	@instance
	@function 
	@memberof j6x(comp).Base
	@param {Object} object
	*/
	proto.setParent = function(p){
		if(this.parent) this.parent.removeChild(this);
		this.parent = p;
		if(p) p.addChild(this);
	};

	/** Allow component to inspect and tweak own attributes and directives, before they are applied.
	
	@instance
	@function initAttr
	@memberof j6x(comp).Base
	@param {Object} attr
	@param {Object} directives
	@param {Array<Function>} updaters
	*/
	proto.initAttr = function(attr, directives, updaters){
		if(attr && attr.tpl && typeof(attr.tpl) == 'function') {
			// used later in initTemplate
			this.__templateJsx = attr.tpl;
			delete attr.tpl;
		}
	}
	
	/* provide different tag name form default if needed
	@instance
	@function tagName 
	@memberof j6x(comp).Base
	*/
	proto.tagName = function(){};

	/* called when the component is initially constructed
	@instance
	@function construct 
	@memberof j6x(comp).Base
	@param {Element} el
	@param {object} parent
	*/
	proto.attach = function(el){
		el._comp = this;
		this.el = el;
	};

	/*
	@instance
	@function applyAttr
	@memberof j6x(comp).Base
	@param {Object} attr
	@param {Object} directives
	@param {Array<Function>} updaters
	*/
	proto.applyAttr = function(attr, directives, updaters){
		// since these attibute-value expressions are defined in parent
		// we must add any updaters to parent updaters array 
		// (changes to parent state should trigger the update) 
		j6x.insertAttr(this.el,attr,updaters);
	};




/*************************** INIT BEFORE VISIBLE stops here ************************/






	/* initialize the component to be shown on screen.
	@instance
	@function __init 
	@memberof j6x(comp).Base
	*/
	proto.__init = function(shown){
		if(!this.__initialized){
			this.__initialized = true;
			var def = this.template(this.state, this.params, this);
			if(def)	j6x.addJsx(this.el, def, null, this );
	
			if(this._jsxChildren){
				this.inspectChildrenJsx(this._jsxChildren);

				var parentNode = this.getContentNode();
				var before = null;
				if(parentNode instanceof Array) {
					// we support array return value to enable also teiing in front which child to insert
					// otherwise it is added as last child
					before = parentNode[1];
					parentNode = parentNode[0];
				}

				// RETHINK code: "this.parent || this"
				// not sure if allowing this type content on root node is a good idea
				j6x.addJsx(parentNode, this._jsxChildren, before, this.parent || this);
			} 
			//...
			this.runUpdaters();
			this.initChildren();
			this.fireEvent('init');
			if(!shown) this.fireEvent('show');
		}
	};

	proto.runUpdaters = function(){
		if(this._updaters) for(var i=this._updaters.length-1; i>=0; i--){
			this._updaters[i].update();
		}
	};

	/** 
	@instance
	@function initChildren
	@memberof j6x(comp).Base
	@param {Object} object
	*/
	proto.initChildren = function(){
		var visible = this.isVisibleTruly();

		// fancy short version of code commented below
		if(visible) this.children.forEach( c=> c.isVisible() && c.__init() );
		// for(var i=0; i<this.children.length; i++){
		// 	c = this.children[i];
		// 	if(visible && c.isVisible()) c.__init();
		// }
	};

	proto.handleParameters = function(def){
		
	};

	proto.template = function(state, params){
		if(this.__templateJsx){
			var tpl = this.__templateJsx;
			// if we are putting a template inside, we want the button events
			this._transitive = true;
			delete this.__templateJsx;
			return tpl(state, params);
		}
	};

	/** Provide placeholder where nodes from parent template will be inserted.<br>
		If array is returned, it is interpreted as [parentNodeToIntertInto, siblingToInsertBefore].
	@instance
	@function getContentNode
	@memberof j6x(comp).Base
	*/
	proto.getContentNode = function(){ return this.el; };

	proto.inspectChildrenJsx = function(jsxArr){};
	
	proto.initNodeAttr = function(n, attr, directive){
		if(attr && attr.p) j6x.setRef(this,new j6x.NodeWrapper(n),attr.p);

		if(directive) j6x.runAttrDirective(n, null, directive, this._updaters, this);
	};

	proto.initChildAttr = function(c, attr, directive){
		if(attr && attr.p) j6x.setRef(this, c, attr.p);
		
		if(directive) j6x.runAttrDirective(c.el, c, directive, this._updaters, this);
	};
	
	/** 
	@instance
	@function getCompName
	@memberof j6x(comp).Base
	@param {Object} object
	*/
	proto.getCompName = function(){
	    if(this.el && this.el.getAttribute){
	        return this.el.getAttribute('as');
	    }
	};

	/** 
	@instance
	@function 
	@memberof j6x(comp).Base
	@param {Object} object
	*/
	proto.addChild = function(c){
		if(!this.el) {
			j6x.logError('', new Error('Component not propery initialized. Must call Base constructor before parseChildren'), {scope:this}, 1);
		}

		var cnt = this.children.length >>> 0;
		for(var i =0; i<cnt; i++) if(c == this.children[i]) return; 
		this.children.push(c);
	};

	/** 
	@instance
	@function 
	@memberof j6x(comp).Base
	@param {Object} object
	*/
	proto.removeChild = function(){
		var found = -1, cnt = this.children.length >>> 0;
		for(var i =0; i<cnt; i++) if(c == this.children[i]) return; 
		if(found != -1) this.children.splice(found,1);
	};

	/** listener shortcut that by default binds callback function to current object/component
	so you can use this in callback without extra bloat otherwise needed

	@instance
	@function listen
	@memberof j6x(comp).Base
	@param {Object} object
	*/
	proto.listen = function(el, evt, listener, options){
		listener = listener || this['on_'+evt];
		this._listenerRemovers.push(j6x.listen( el, evt, listener, this, options));
	};

	/** 
	@instance
	@function addListener
	@memberof j6x(comp).Base
	@param {Object} object
	*/
	proto.addEventListener = function(evtName, callback){
		if(mi2.domEvents[evtName]){
			return j6x.listen(this.el, evtName, callback);
		}

		var l = this.__listeners[evtName];
		if(!l) l = this.__listeners[evtName] = [];

		l.push(callback);
		return function(){
			var idx = l.indexOf(callback);
			if(idx != -1) l.splice(idx,1);			
		}
	};


/** Fire event in desired direction in component tree (the component itself, to children, to parent)
	
	@method fireEvent
	@memberof j6x(comp).Base
	@instance

	@param {String|EventObject} evt event or just event name


	@example
// version when there is no additional data with event
this.someComp.fireEvent('reload'); 

// tell child component to reload
this.someComp.fireEvent({name:'reload'}); 

// tell all children components to reload
this.fireEvent({name:'reload', fireTo:'children'}); 

// tell parent you want to submit (inputs can fire this)
this.fireEvent({name:'submit', fireTo:'parent'}); 

// if the event is caused by domEvent, pass it along as domEvent property
this.fireEvent({name:'submit', fireTo:'parent', domEvent:evt}); 

	*/
	proto.fireEvent = function(evt){

		if(typeof(evt) == 'string'){
			evt = {name:evt};
		}
		var evtName = evt.name;
		var fired = false;

		var required = evt.required;
		if(evt.required) delete evt.required;

		if(evtName == 'show'){
			// if not initialized yet, fire init event first
			this.__init(true);
		}

		if(!evt) evt = {};
		evt.target = this;
		
		var continueFire = true;
		if(evt.direction == 'parent' && this.parent && this.isTransitive(evt)){
			fired = this.parent.fireEvent(evt);
			continueFire = false;
		}

		if(continueFire){

			if(typeof(this['on_'+evtName]) == 'function'){
				try{
					this['on_'+evtName](evt);
					fired = true;
				}catch(e){
					j6x.logError('Error calling event handler function on_'+evtName, e, {scope:this});
				}

			}

			var l;
			if(this.__listeners) l=this.__listeners[evtName];
			if(l) for(var i=0; i<l.length; i++){
				try{
					l[i](evt);
					fired = true;
				}catch(e){
					j6x.logError('Error firing event '+evtName, e, {evt, listener: l[i]} );
				}
			}

			var child;
			if(evt.fireTo == 'children' && this.children){
				for(var i=0; i<this.children.length; i++){
					child = this.children[i];
					// if hidden no need for hide/show event to propagate
					if(!child.isVisible() && (evtName == 'hide' || evtName == 'show' )) continue; 
					
					if(child.fireEvent(evt)) fired=true;;
				}
			}

		}

		if(required && !fired){
			j6x.logError('WARNING: event required but not caught '+ evt.name, new Error(), {evt, el:this.el, scope:this} );
		}
		return fired;
	};

	/** By default setValue calls this.expandVars. Input components for example override 
	setValue for purpose of setting input values

	@instance
	@function setValue
	@memberof j6x(comp).Base
	@param {Object} data
	*/
    proto.setValue = function(val){
		if(typeof val == 'object')
			this.expandVars(val || {});
		else
			this.expandVars({value:val});
    }

	/*
	@instance
	@function expandVars
	@memberof j6x(comp).Base
	@param {Object} data
	*/
    proto.expandVars = function(data){
    	for(var p in data){
    		this.state[p] = data[p];
    	}
    	this.markDirty();
    };

	/*
	@instance
	@function arkDirty
	@memberof j6x(comp).Base
	@param {Object} data
	*/
    proto.markDirty = function(data){
    	j6x.markDirtyComp(this);
    };

	/** Check visibility, but only report visible if the compoentn itself is visible,
	and all of it's parents.

	@instance
	@function isVisibleTruly
	@memberof j6x(comp).Base
	*/
	proto.isVisibleTruly = function(){
		var c = this;
		while(c){
			if(!c.isVisible()) return false;
			c = c.parent;
		}
		return true;
	};

	/** Change visibility of the component. 
	It is reliant on the css used, and by default uses 'hidden' HMTL attribute.

	@instance
	@function setVisible
	@memberof j6x(comp).Base
	@param {boolean} visible
	*/
	proto.setVisible = function(visible){
		if(visible == this.isVisible()) return;

		j6x.h_setVisible(this.el, visible);

		// when hidden by parent, there is no point in firing the event
		// correct event will be fired when parent becomes visible
		if(!this.parent || this.parent.isVisibleTruly()) 
			this.fireEvent({name:visible ? 'show':'hide',fireTo:'children'});
	};

	/** 
	setTimeout shortcut that by default binds callback function to current object, 
	so you can use this in callback without extra bloat otherwise needed
	@instance
	@function setTimeout
	@memberof mi2JS(comp).Base
	@param {Object} object
	*/
	proto.setTimeout = function(fc,delay){
		return setTimeout( fc.bind(this), delay );
	};

	/** 
	requestAnimationFrame shortcut that by default binds callback function to current object, 
	so you can use this in callback without extra bloat otherwise needed
	@instance
	@function requestAnimationFrame
	@memberof mi2JS(comp).Base
	@param {Object} object
	*/
	proto.requestAnimationFrame = function(fc){
		return requestAnimationFrame( fc.bind(this) );
	};
  
	/** 
	setInterval shortcut that by default binds callback function to current object, 
	so you can use this in callback without extra bloat otherwise needed

	@instance
	@function setInterval
	@memberof mi2JS(comp).Base
	@param {Object} object
	*/
	proto.setInterval = function(fc,delay){
		return setInterval( fc.bind(this), delay );
	};

	/** Implement this to return true for transitive components (example: base/Loop). 
	Transitive component will forward events meant for parent.<br>
	base/Button inside a base/Loop will fire the event when clicked, but base/Loop will forward it to it's parent.
	This is desirable in this case as the loop is usually used inside an application component, and that component
	will want to catch the event from the button like it is usual when the button is a direct child.
	@instance
	@function isTransitive
	@memberof j6x(comp).Base
	@param {Object} object
	*/
	proto.isTransitive = function(evt){ return this._transitive || false; };

	/** cleanup listeners and and references that might not be collected by 
	    garbage collector
	
	@instance
	@function destroy
	@memberof j6x(comp).Base
	*/
	proto.destroy = function(){
		delete this.el._comp;
		this._listenerRemovers.forEach((remover)=>remover());
	};

});

j6x.getComp('Base');
