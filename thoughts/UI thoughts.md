# events

- `listen` function returns a callback function that can later be used to remove the listener

# component creation

## create

  - create DOM node for the component
  - ::`construct(el, parent)` - create new instance
      - `el` - reference to the new DOM node
      - `parent` - parent component (can be null)
  - ::`initAttr(attr, directives, updaters)` - allow component to inspect and tweak own attributes and directives, before they are applied
      - `attr` - attributes object
      - `directives` - options for directives (separated from attributes if having `-` in the name like: `x-click`)
      - `updaters` - array with parent's updaters (functions called when parent state changes)
  - create `state` and `params` object for the new component
  - initialize parameters, remove keys that will not be reflected as attributes (... maybe create prop with listeners)
  - apply attributes and directives not removed by `initAttr` and not used by parameters

**----------- lazy-initialized components stop here until shown (visible) -------------**

## init

  - ::`__init` - internal
  - ::`template(h, t, state, params, self)` - return JSX template for the component
      - `h` - required for JSX (do not change the name of this parameter!)
      - `t` - required for JSX translations (do not change the name of this parameter!)
      - `state` - state object
      - `params` - params object
      - `self` - reference to `this` of the component (optional, use if needed)
  - `initChildrenJsx(jsx)` - allow component to tweak children jsx (jsx comming from parent template that will go into this component somewhere)
      - `jsx` -  JSX that parent added between your tags when the component is used
  - insert child DOM 
      - simple nodes (DOM node created, but attributes not applied yet and can be inspected for each via `initNodeAttr` 
      - components ( DOM node and component created, but attributes not applied yet and can be inspected via `initChildAttr`)
  - ::`initNodeAttr(node, attr, directives, updaters)` - allow component to inspect and tweak node attributes before they are applied
  - ::`initChildAttr(child, attr, directives, updaters)` - allow component to inspect and tweak child attributes before they are applied
  - ::`initChildren`- initialize template, child nodes, and components (lazy-loaded and those not visible, will be created, but not initialized)
  - `on_init` - init event fired on self only

# JSX recognize function is component

`typeof x == 'function' && x.prototype instanceof j6x.NodeWrapper`



```js

// if text, put the text
// if NodeUpdater ...
// .. etc, maybe some other usefull value

// if TagDef insert again (could be a compoennt definition or just nodes with compoennts inside)
if(typeof def.tag == 'function'){
    if(def.tag instanceof j6x.Dom){
        // cereate first
    	j6x.addComp(def, node, parent);       
        // init later ... 
    }else{
        var ret = def.tag(def, node, parent);
        // recurive call to check the value and insert in the same place
    }
}
```





# component parameters
  - for some attributes, it is very useful to be reflected as attribute, as it allows for convenient CSS style targeting.
      + `disabled` - isEnabled/setEnabled
      + `required`
      + `selected` - isSelected/setSelected
      + `readonly` - isReadOnly/setReadOnly
  - trigger render (all,some ... cofigurable ?) - will changing the parameter trigger render 

```js
proto.params = {
    diabled: Boolean,
    required: {type:Boolean, attr:true},
    readOnly: {type:Boolean, attr:true, render: true,  default: false}
}
```

param change event is fired, and component can choose to render if aplicable

group updaters responsible for component directly
defer initial udpaters update until data ready (component can choose to get async data first for eaxmple)
loop for example takes "tpl" parameter that has a function that generates template fo rinline component

# filtering

All inputs internally use a specific value: Number, String, Date, Boolean.

Filters are needed for conversion between internal type and desired type

- `in` (getValue) - internal type -> our type
- `out` (setValue) - our type - > internal type 

Inputs with text typing also can use filters when converting from/to text representation:

- `format`  - display in the text field from internal value (internal type)
- `parse` - parse from text and generate internal type
  - can be used to sanitize the value (trim, lowercase)
- `repair` - repair value before parsing
  - the repaired value is applied to the text field
  - used to allow more flexibility
  - example: "1.1" -> "1.1.2019"
  - example: "1,1,14" -> "1.1.2014"

setup a Calendar

```jsx
<div as="base_Calendar" filters={{in:'fixServerDate', out: filters.toServerDate, format: filters.dateFormat, parse:'fixDate'}}></div>
```

setup a calendar with default fiters defined elswhere

```jsx
// define at some point
APP.defCalendarFitlers = {
    in:'fixServerDate', 
    out: filters.toServerDate, 
    format: filters.dateFormat, parse:'fixDate'
};
// ... apply 
<div as="base_Calendar" filters={APP.defCalendarFitlers}></div>
```

trim spaces from input

```jsx
<input as="base_Input" filters={parse:'trim'}/>
```




# directives
called before applying the attributes

- on jsx attributes of DOM node (`comp: null`)
- on jsx attributes of component

- context
   - `el` - current dom node 
   - `comp` - current component
   - `parent` - parent component 


#component tag and as=""
```html
// convert 
<button as="base.Button" class="bt1" event="save">{'save'}</button>
// to 
<base.Button tag="button" class="bt1" event="save">{'save'}</base.Button>
// the closing tag is only visible in JSX, and after it is parsed to js, tag name is sent as first parameter once

```

# basic interface components 

to make easy to create UI 

 - form - not a component actually  (a way to collect key/value data and also set and validate)
 - modal dialog (with return value in callback: `ok|cancel`)
 - notification bubbles
 - date input
 - time input
 - date-time input
 - AutoComplete

## Modal dialog
  - title
  - text or a component to embed
  - configurable buttons below  `ok|cancel`


## Date, Time, DateTime
 - works with Date
 - input convert (converts data provided by a form into a Date Object)
 - output convert (converts Date to value expected by the form)
 - display format function (expects Data)
 - parse text function (converts to Date)
 - text expand function (to allow user to write partial versions that are the expanded)


## Notification bubbles

general:

 - default duration

per bubble:

 - duration (if not default)
 - title
 - text
 - html (nodes, but not HTML text)

# component API 

enable basic components to be interchangeable with different implementations 

- this is still just an idea
- is it useful ?

## behavior

define behavior that is expected (minimal)

## tests

possibly make tests to confirm compatibility at API level