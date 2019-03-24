describe( 'Base.js ', function () { 

	var h = j6x.h;
	var t = j6x.t;


	j6x.addCompClass('test/LazyTestIn', 'Base', 
	function(h,t,proto, superProto, comp, superClass){

		proto.template = function(state, params, self){
			return <b p="bt1" as="Base">ok</b>;
		};
	});

	j6x.addCompClass('test/LazyTest', 'Base', 
	function(h,t,proto, superProto, comp, superClass){

		proto.template = function(state, params, self){
			return <div p="inside" as="test/LazyTestIn"></div>;
		};

	});

	function logStack(message){
		var err = new Error();
		console.log(message, err.stack);
	}

	j6x.addCompClass('test/ShowHideInitTest', 'Base',
	function(h,t,proto, superProto, comp, superClass){
		proto.construct = function(){
			superProto.construct.call(this);
			this.on_show_count = 0;
			this.on_hide_count = 0;
			this.on_init_count = 0;
		}
		proto.on_show = function(){ this.on_show_count++; }
		proto.on_hide = function(){ this.on_hide_count++; }
		proto.on_init = function(){ this.on_init_count++; }
	});


	it(' / lazyInit', function () {
		var comp = j6x.addComp(null,<b as="test/LazyTestIn" hidden/>);

		expect(comp.bt1).toEqual(undefined);
		expect(comp.el.innerHTML).toEqual('');
		comp.setVisible(true);
		expect(comp.el.innerHTML).toEqual('<b p="bt1" as="Base">ok</b>');
		expect(comp.bt1 instanceof j6x.getComp('Base')).toBeTruthy();	
	});


	describe('setTimeout-bind', function () {
		var node = j6x.addComp(null,{tag:'B', attr:{as:'Base'}});

		var self = null;

		beforeEach(function(done) {
			comp.setTimeout(function(){
				self = this;
				done();
			},10);
		});

		it('should bind',function() {
			// expect(self).toEqual(comp);
		});

	});

	it(' / show hide event', function () {
		var comp = j6x.addComp(null, <b as="test/ShowHideInitTest" hidden/>);
		
		comp.setVisible(true);
		expect(comp.on_show_count).toEqual(1);
		expect(comp.on_init_count).toEqual(1);

		comp.setVisible(false);
		comp.setVisible(true);
		expect(comp.on_show_count).toEqual(2);
		expect(comp.on_init_count).toEqual(1);
		expect(comp.on_hide_count).toEqual(1);

	});

	it(' / show hide event skip', function () {
		// var comp = j6x.addComp(null,{tag:'B', attr:{as:'test/ShowHideInitTest',hidden:''}, 
		// 	html:'<b as="test/ShowHideInitTest" p="child" hidden>x</b>'});
		var comp = j6x.addComp(null,<b as="test/ShowHideInitTest" hidden >
				<b as="test/ShowHideInitTest" p="child" hidden>x</b>
			</b>);
		
		expect(comp.on_show_count).toEqual(0);
		comp.setVisible(true);
		expect(comp.on_show_count).toEqual(1);

		expect(comp.child.on_show_count).toEqual(0);
		comp.setVisible(false);
		expect(comp.child.on_hide_count).toEqual(0);

		// show child while parent hidden (must skip)
		comp.child.setVisible(true);
		expect(comp.child.on_show_count).toEqual(0);
		
		// show parent now when child is visible (must fire)
		comp.setVisible(true);
		expect(comp.child.on_show_count).toEqual(1);

	});

});