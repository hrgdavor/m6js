describe( 'html.js', function () { 
	var h = j6x.h;

	it('/ addTag', function () { 
//		var tpl = {tag:'DIV', attr:{'class':'test'}, html:'<b p="b1"></b>'};
		var node = j6x.addJsx(null, <div class="test"><b p="b1"></b></div>);

		expect(node.innerHTML).toEqual('<b p="b1"></b>');
		expect(node.className).toEqual('test');
	});

	it('/ attr', function () { 
		// var tpl = {tag:'DIV', attr:{'my-attr':'test'}, html:''};
		var div = j6x.add(null, <div my_attr="test"/>);
		expect(div.attrStr('my_attr')).toEqual('test');
	});

	it('/ setVisible', function () {
		// var tpl = {tag:'DIV', attr:{}, html:''};
		var div = j6x.add(null, <div/>);

		expect(div.isVisible()).toBeTruthy();

		div.setVisible(false);
		expect(div.isVisible()).toEqual(false);
		expect(div.el.hasAttribute(j6x.hiddenAttribute)).toEqual(true);
	});

	it('/ setSelected', function () {
		//var tpl = {tag:'DIV', attr:{}, html:''};
		var div = j6x.add(null, <div/>);

		expect(div.isSelected()).toEqual(false);

		div.setSelected(true);
		expect(div.isSelected()).toEqual(true);
		expect(div.hasAttr("selected")).toEqual(true);
	});

	it('/ setText', function () {
		// var tpl = {tag:'DIV', attr:{}, html:''};
		var div = j6x.add(null, <div/>);

		expect(div.el.firstElementChild).toEqual(null);

		div.setText('xxx')

		expect(div.el.innerHTML).toEqual('xxx');
	});

	it('/ attrBoolean', function () { 
		// var tpl = {tag:'DIV', attr:{'required':''}, html:'<b p="b1"></b>'};
		var node = j6x.addJsx(null, <div required><b p="b1"></b></div>);
		var nw = new j6x.Dom(node);

		expect(nw.attrBoolean('required')).toBeTruthy();

		node.setAttribute('required','1');
		expect(nw.attrBoolean('required')).toBeTruthy();

		node.setAttribute('required','0');
		expect(nw.attrBoolean('required')).toBeFalsy();

		node.setAttribute('required','required');
		expect(nw.attrBoolean('required')).toBeTruthy();

		node.setAttribute('required','true');
		expect(nw.attrBoolean('required')).toBeTruthy();

		node.setAttribute('required','false');
		expect(nw.attrBoolean('required')).toBeFalsy();
	});


});