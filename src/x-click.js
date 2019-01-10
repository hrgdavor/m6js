(function(j6x){

j6x._xClickCancel = function(el){
	
	// if disabled at any level 
	if(el.hasAttribute(mi2JS.disabledAttribute)) return true;
	
	// do not mess with other components
	comp = el.getAttribute('as');
	return (comp && el != this.el && !(comp == 'Base' || comp =='Base' )); 
};

j6x._xClickEventData = function(el,evt, end){
	var evtNames = [], actions = [], comp, cancelClick = false;
	while(true){
		if(j6x._xClickCancel(el)) cancelClick = true;

		if(el.hasAttribute('event')) evtNames.push(el.getAttribute('event'));
		if(el.hasAttribute('action')) actions.push(el.getAttribute('action'));

		if(el == end) break;
		el = el.parentNode;
	}

	actions.push('default');
	
	return {
			action:actions[0],
			actions:actions,
			events:evtNames,
			name: evtNames[0],
			domEvent: evt,
			cancelClick: cancelClick,
			target: el,
			required: true,
			fireTo: 'parent'
		};
};

j6x._xClickListen = function(n, options, updaters, parentComp){
	if(!parentComp) return;
	parentComp.listen(n,'click',function(evt){
		var evtData = j6x._xClickEventData(evt.target, evt,n);
		var context;
		var attrValue = options._;
		if(typeof attrValue == 'function'){
			context = attrValue(evt, evtData.action);
		}else if(typeof attrValue == 'string'){
			evtData.name = attrValue;
		}

		evtData.context = context;

		// WORKAROUND to be compatible with base/Button
		// changing fireEvent recognitionf of skipping the initiator component
		// would break base/Button behavior, so this trick is used to make it work along
		evtData.__src = parentComp;

		if(evtData.name && !evt.cancelClick){
			parentComp.fireEvent(evtData);
		} 

//		parentComp.fireEvent('');
	});
}

j6x.registerDirective('x-click', function(el, comp, options, updaters, parentComp){
	if(comp) throw new Error('x-click not supported on component nodes');
	j6x._xClickListen(el, options, updaters, parentComp);
});

})(j6x);