describe( 'dom utilities', function () { 
	var h = j6x.h;

	it( 'attr', function () { 
		var comp = j6x.add(null,<div/>);
		expect(comp.el.tagName).toEqual('DIV');

		comp.attr('action','add');
		expect(comp.el.outerHTML).toEqual('<div action="add"></div>');

		comp.attr('action',null);
		expect(comp.el.outerHTML).toEqual('<div></div>');
	});

	it( 'attr multiple', function () { 
		var n1 = j6x.addJsx(null,<div/>);
		var n2 = j6x.addJsx(null,<span/>);
		var comp = new j6x.DomArr([n1,n2]);
		
		expect(comp.el[0].tagName).toEqual('DIV');
		expect(comp.el[1].tagName).toEqual('SPAN');

		comp.attr('action','add');
		expect(comp.el[0].outerHTML).toEqual('<div action="add"></div>');
		expect(comp.el[1].outerHTML).toEqual('<span action="add"></span>');

		comp.attr('action',null);
		expect(comp.el[0].outerHTML).toEqual('<div></div>');
		expect(comp.el[1].outerHTML).toEqual('<span></span>');

		// static function
		j6x.h_attr(n1,'action','add');
		j6x.h_attr(n2,'action','add');
		expect(comp.el[0].outerHTML).toEqual('<div action="add"></div>');
		expect(comp.el[1].outerHTML).toEqual('<span action="add"></span>');

	});

	it( 'attr map', function () { 
		var n1 = j6x.addJsx(null,<div/>);
		var n2 = j6x.addJsx(null,<span/>);

		j6x.h_attr(n1,'action','add');
		j6x.h_attr(n2,'action','remove');

		var obj = {n1: n1, n2:n2};
		expect(j6x.dom(obj).map( (item)=>item.getAttribute('action')  )).toEqual({n1: 'add', n2: 'remove'});

		var arr = [n1,n2];
		expect(j6x.dom(arr).map( (item)=>item.getAttribute('action')  )).toEqual(['add', 'remove']);
	});
});