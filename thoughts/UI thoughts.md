See also: 

- [component creation](component.creation.md)





# events

- `listen` function returns a callback function that can later be used to remove the listener

# JSX recognize function is component

`typeof x == 'function' && x.prototype instanceof j6x.comp.Base`



```js

// if text, put the text
// if NodeUpdater ...
// .. etc, maybe some other usefull value

// if TagDef insert again (could be a compoennt definition or just nodes with components inside)
if(typeof def.tag == 'function'){
    if(def.tag instanceof j6x.comp.Base){
        // cereate first
    	j6x.addComp(def, node, parent);       
        // init later ... 
    }else{
        var ret = def.tag(def, node, parent);
        // recursive call to check the value and insert in the same place
    }
}
```





# component parameters
  - it is very useful for some attributes, to be reflected as DOM attribute. It allows for convenient CSS style targeting.
      + `disabled` - isEnabled()/setEnabled(e)
      + `required`
      + `selected` - isSelected()/setSelected(s)
      + `readonly` - isReadOnly()/setReadOnly(r)
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