j6x.addCompClass('base.Base', '',

function(h,t,proto, superProto){
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
	proto.construct = function(attr, directive, children){
		this.state = {};
		this.params = {};
		this._children = [];
		this.el = el;
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


});
