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
	proto.construct = function(el, attr, directive, parent){
		this.state = {};
		this.params = {};
		this.children = []
		this._listenerRemovers = [];
		this.el = el;
	};

	proto.destroy = function(){
		this._listenerRemovers.forEach((remover)=>remover());
	};

	proto.__init = function(){
		if(!this.__initialized){
			this.__initialized = true;
			var def = this.template(this.state, this.params, this);
			if(def)	j6x.addJsx(this.el, def, null, this._updaters, this);
			this.initUpdaters();
			this.initChildren();
			this.fireEvent('init');
		}
	};

	proto.initUpdaters = function(){
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
		var c;
		for(var i=0; i<this.children.length; i++){
			c = this.children[i];
			if(!c.lazyInit) c.__init();
		}
	};

	proto.handleParameters = function(def){
		
	};

	proto.template = function(state, params){};

	proto.initChildrenJsx = function(jsx){return jsx; };
	
	proto.initNodeAttr = function(n, attr, directive){
		if(directive) j6x.runAttrDirective(n, null, directive, this._updaters, this);
	};

	proto.initChildAttr = function(c, attr, directive){
		if(directive) j6x.runAttrDirective(c.el, c, directive, this._updaters, this);
	};
	
	proto.initAttr = function(attr, updaters){
		// init own attributes, but since expressions are in parent
		// add any updaters there as changes to parent state should trigger the update 
		j6x.insertAttr(this.el,attr,updaters);
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
			var msg = 'Component not propery initialized. Must call Base constructor before parseChildren';
			console.log(msg, this, this.el);
			throw new Error(msg);
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

	/** 
	@instance
	@function 
	@memberof j6x(comp).Base
	@param {Object} object
	*/
	proto.setParent = function(p){
		var old = this.parent;
		if(old && old.removeChild) 
			old.removeChild(this);
		this.parent = p;
		if(p  && p.addChild) p.addChild(this);
	};

	/** listener shortcut that by default binds callback function to current object/component
	so you can use this in callback without extra bloat otherwise needed

	@instance
	@function listen
	@memberof j6x(comp).Base
	@param {Object} object
	*/
	proto.listen = function(el,evt,listener, scope, options){
		scope = scope || this;
		listener = listener || this['on_'+evt];
		this._listenerRemovers.push(j6x.listen( el, evt, listener, scope, options));
	};

	/** 
	@instance
	@function addListener
	@memberof j6x(comp).Base
	@param {Object} object
	*/
	proto.addEventListener = function(evtName, callback){
		if(!this.__listeners) this.__listeners = {};
		var l = this.__listeners[evtName];
		if(!l) l = this.__listeners[evtName] = [];

		l.push(callback);
	};

	proto.removeEventListener = function(evtName,callback){
		if(!this.__listeners) return;
		var l = this.__listeners[evtName];
		if(!l) return;

		var idx = l.indexOf(callback);

		if(idx != -1) l.splice(idx,1);
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
			this.__init();
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
					console.log('Error calling event handler function ','on_'+evtName, evt, 'component', this , 'error', e);
					console.error(e.message);
				}

			}

			var l;
			if(this.__listeners) l=this.__listeners[evtName];
			if(l) for(var i=0; i<l.length; i++){
				try{
					l[i](evt);
					fired = true;
				}catch(e){
					console.log('Error firing event ',evtName, evt, 'listener', l[i], 'error', e);
					console.error(e.message);
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
			console.log('WARNING: event required but not caught ', evt.name, evt, this.el, this);
		}
		return fired;
	};

	/** Implement this to return true for transitive components (example: base/Loop). 
	Transitive component will forward events meant for parent.<br>
	base/Button inside a base/Loop will fire the event when clicked, but base/Loop will forward it to it's parent.
	This is desirable in this case as the loop is usually used inside an application component, and that component
	will want to catch the event from the button like it is usual when the button is a direct child.
	@instance
	@function isTransitive
	@memberof mi2JS(comp).Base
	@param {Object} object
	*/
	proto.isTransitive = function(evt){ return false; };

});
