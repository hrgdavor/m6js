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
	proto.construct = function(el,attr, directive, children){
		this.state = {};
		this.params = {};
		this._children = [];
		this.el = el;
	};

	proto.__init = function(){
		if(!this.__initialized){
			this.__initialized = true;

		}
	};

	proto.handleParameters = function(def){
		
	};

	proto.template = function(state, params){};

	proto.initChildrenJsx = function(jsx){return jsx; };
	
	proto.initNodeAttr = function(n, attr, directive){
		if(directive) j6x.runAttrDirective(n, null, directive, this._updaters, this, j6x.directives);
	};

	proto.initChildAttr = function(c,attr, directive){
		if(directive) j6x.runAttrDirective(c.el, c, directive, this._updaters, this, j6x.directives);
	};
	
	proto.initAttr = function(attr, updaters){
		// init own attributes, but since expressions are in parent
		// add any updaters there as changes to parent state should trigger the update 
		j6x.insertAttr(this.el,attr,updaters);
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

});
