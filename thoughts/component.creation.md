# component creation

## create

- ... create new instance
- `construct()`
- `setParent(parent)`
  - `parent` - parent component (can be null)
- `initAttr(attr, directives)` - allow component to inspect and tweak own attributes and directives, before they are applied
  - `attr` - attributes object
  - `directives` - options for directives (separated from attributes if having `-` in the name like: `x-click`)
- ... initialize parameters, remove keys that will not be reflected as attributes (... maybe create prop with listeners)
- `tagName()` - provide different tag name form default if needed
- ... create DOM node for the component, and insert into proper position
- `attach(el)` - attach instance to DOM node
  - `el` - reference to the new DOM node
- ::`applyAttr(attr, directives)` apply attribute values to node ( and even from directives not removed by `initAttr` and not used by parameters)

**-----------  components stop initialization here until shown (visible) -------------**

## init

- `__init` - internal
- `template(h, t, state, params, self)` - return JSX template for the component
  - `h` - required for JSX (do not change the name of this parameter!)
  - `t` - required for JSX translations (do not change the name of this parameter!)
  - `state` - state object
  - `params` - params object
  - `self` - reference to `this` of the component (optional, use if needed)
- `initChildrenJsx(jsx)` - allow component to tweak children jsx (jsx comming from parent template that will go into this component somewhere)
  - `jsx` -  JSX that parent added between your tags when the component is used
- ... insert child DOM 
  - simple nodes (DOM node created, but attributes not applied yet and can be inspected for each via `initNodeAttr` 
  - components ( DOM node and component created, but attributes not applied yet and can be inspected via `initChildAttr`)
- `initNodeAttr(node, attr, directives, updaters)` - allow component to inspect and tweak node attributes before they are applied
- `initChildAttr(child, attr, directives, updaters)` - allow component to inspect and tweak child attributes before they are applied
- `initChildren`- initialize template, child nodes, and components (lazy-loaded and those not visible, will be created, but not initialized)
- `on_init` - event fired on self (not propagated)