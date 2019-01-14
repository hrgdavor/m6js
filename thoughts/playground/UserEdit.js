j6x.addCompClass('admin.UserEdit', '',

function(h,t,proto, superProto, comp, superComp){
	var base = j6x.base;
	var admin = j6x.admin;

	proto.entity = 'User';
	proto.entityName = 'user';
	proto.idColumn = 'id';
	proto.nameColumn = 'name';

	proto.initChildren = function(){
		superProto.initChildren.call(this);
		this.$items.required = true;
	};

	proto.doEdit = function(data){
//		this.items.roles.setConfig(USER.allRoles.map((r)=>({id:r.code, text:r.name})));
		superProto.doEdit.call(this,data);
		this.rolesArea.setVisible(data.id != USER.id);
		this.expandVars({isAdmin:USER.isAdmin(), id:data.id});
	};

	proto.getValue = function(){
		var data = this.$items.getValue();
		if(!this.rolesArea.isVisible()) delete data.roles;
		if(!data.password) delete data.password;

		var validity = this.$items.validate();
		this.$items.markValidate(validity);
		if(!validity.isValid()) return;

		if(data.id == 0 && !data.password){
			MAIN_APP.notify({title:'required_field',message:'password'});
		}else{
			return data;
		}
	};

	proto.template = function(state, params){

return <div class="form">
	<Input p="items.id"/>
	<Input name="id"/>
	<Input p-items="id"/>

	<div class="tabButtons">
		<button p-tabs="users">{'users'}</button>
		<button p="tabs.reports">{'reports'}</button>
		<button p-tabs-reports>{'reports'}</button>
	</div>


	<div class="form-group">
		<label>{'name'}:</label>
		<Input name="name" class="form-input"/>
	</div>
	<div class="form-group">
		<label>{'username'}:</label>
		<Input p="items.username" class="form-input"/>
	</div>
	<div class="form-group">
		<label>{'email'}:</label>
		<Input p="items.email" class="form-input"/>
	</div>
	<div class="form-group">
		<label>{'password'}:</label>
		<Input p="items.password" class="form-input" tpye="password" required={false}/>
	</div>
	<div class="form-group" p="rolesArea">
		<label>{'roles'}:</label>
		<MultiCheck p="items.roles" class="form-input" required={false}/>
	</div>

	<div class="form-buttons">
		<button as="base.Button" class="bt1" event="save">{'save'}</button>
		<Button tag="button" class="bt1" event="done" action="cancel">{'cancel'}</base.Button>
		<Button class="bt2" event="delete" hidden={!state.isAdmin || state.id==0}>{'delete'}</base.Button>
	</div>
</div>

	}


});
