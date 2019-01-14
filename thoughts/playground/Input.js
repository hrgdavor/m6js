j6x.addCompClass('base.Input', 'InputBase',

function(h,t,proto, superProto, comp, superComp){
	var base = j6x.base;

	proto.defaultClass = 'base-input';
	proto.state = {

	};

	proto.params = {

	};

	// must be called before #template()
	proto.handleParameters = function(def){
		// take attributes out that are parameters
	};


	proto.template = function(state, params){
		var Input = 'input';
		var type = params.type || 'text';
		if(type == 'select') {
			Input = 'select';
			type = void 0;
		}

		return <div>
			<Input type={type}/>
		</div>
	};

});
