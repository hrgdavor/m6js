# x-click

## introduction

This directive is nice alternative to `onclick` as it enables you to make an element clickable but implements some extra useful logic.

- can be disabled via `disabled` attribute (which can then also be CSS styled)
- ignores `doubleclick`

```jsx
<button x-click={this.saveDocument()}>{'save'}</button>
```

if `disabled` attribute is present, click is ignored and

```jsx
<button x-click={this.saveDocument()} disabled>{'save'}</button>
```

you easily can style a disabled element using: `[disabled]{color:gray;}`



## advanced usage

The `x-click` directive will catch click event on the element and all of it's children, and this can be used to handle multiple clickable elements with single instance.

Code is looking for 3 DOM attributes that can additionally customize the behaviour. 

- `event` - defines event-name 
  - alternatively  `x-click event="eventName"` can be shortened to  `x-click="eventName"` 
- `action` - optional distinction needed for cases when multiple elements are clickable with different behaviour 
- `disabled` - disables the execution

Using attributes for these options is intentional as it also provides a nice CSS target for styling.

A more complex user-case can have multiple clickable elements with attributes `event` or `action` (even one inside another) so the most inner child's value for each attribute is used as the value.​



## catching events

events are caught by implementing `on_eventName(event){...}` method for the component 

- `save` is caught by implementing `on_save(event){...}`
- `deleteUser` is caught by implementing `on_deleteUser(event){...}`

## event defaults

`{action:'default', required:true, direction:'parent'}`

- `action:'default'` - can be overridden by adding attribute: `action="whatever"`
- `required: true` - force event handling code to throw error if no handler is found
- `direction:'parent'` - utility containers like loops, tables or layout utilities should forward the event down 
  - because those containers are used inside a Component's template and intention is for component (who's template we are writing at the moment) to catch the event.


## more usage examples

#### 1) fire `save` event 

```html
<button x-click="save">{'save'}</button>
```
 caught by implementing `on_save(event){...}`

- event: `{name:'save'}`

#### 2) fire `edit` event with context

action is left as an attribute and value is not caught in any way before applying the attribute's value, so it can only be string. If other value type is needed like numeric or complex object, then context mode can be used.

```html
<button x-click={state.id} event="edit">{'edit'}</button>
```

 caught by implementing `on_edit(event){...}`

- sample state: `{id:12}`
- event: `{name:'edit', context:12}`


#### 3) fire `changeLanguage` event with custom `action`

```html
<button x-click="changeLanguage" action="en">{'en'}</button>
<button x-click="changeLanguage" action="de">{'de'}</button>
```
 caught by implementing `on_ChangeLanguage(event){...}`

- button1 event: `{name:'changeLanguage', action='en'}`
- button2 event: `{name:'changeLanguage', action='de'}`

#### 4) call `changeLanguage` with parameter

```html
<button x-click={this.changeLanguage('en')}>{'en'}</button>
<button x-click={this.changeLanguage('de')}>{'de'}</button>
```
#### 5) call a method

```html
<button x-click={this.showDataTable()}>{'show_data'}</button>
```
it is good to keep this in mind: JSX parser will actually wrap the above in arrow function:

```html
<button x-click={()=>this.showDataTable()}>{'show_data'}</button>
```

so the code will not be evaluated during render, but passed as code wrapped in arrow function that can be evaluated when needed

#### 4) call a method and use original DOM event and action

```html
<button x-click={(evt,action)=>this.showDataTable(evt.target,action)}>
    {'show_data'}
</button>
```

The 2 parameters are always provided when calling the function that is part of JSX expression in the value of `x-click`. 

In case no function wrapper was added in the code, the default behaviour of JSX parser will be to add a wrapper around it anyways.



## random thoughts / ideas

#### implementation thoughts:

- If `x-click` value is jsx expression, it will evaluate to a function.

- in case value is function, the function will always be executed with 2 params: `func.call(compThis,domEvent,action)` this way putting custom code in to `x-click` will be executed with those 2 parameters and can be used if needed

#### potential conflict situation: missing event-name

unlikely an issue, but thought of

in case `x-click` expression is used to provide context for event and no event-name was found

- it means no event will be fired as expected
- but `x-click` function must be evaluated as this is a use-case for putting a custom method call into `x-click`  
- if generating context value has no side-effects, then this behaviour is not problematic



buttons (previously done with button component). 

- keep: old fire to parent concept could be useful within tables, loops
- make catching event mandatory, so it is error if nobody consumes event

```html
<div x-click class="buttonsArea" event="done">
    {event:done, action:save}
    <button action="save">{'save'}</button>

    click should not work if element is disabled
    {event:done, action:save}
    <button action="delete" disabled={!USER.isAdmin()}>{'delete'}</button> 

    nested case, should not trigger both, but the inner on 
    (responsibility of the implementation of 'clickable' directive)
    if no event attrib is defined, the value is considered the function to call
    <button x-click={this.navigateBack()}>{'back'}</button>
    
    nested case, with event name directly as value
    <button x-click="save">{'save'}</button>

    should not trigger on component nodes
    <base.Input type="text">
</div>

<table>
<tbody>
    if there is an event attribute, then value is the context data to send
    it will be wrapped in function call for templates, so function will be evaluated
    to get the value. this is desired if value changes on subsequent update to a loop
    <tr x-click={{id:state.id}} event="rowClick">
        {event:rowClick, context:{id:12} action:'default'} 
        due to event attrib defined on parent node
        <td>{state.name}</td>
        <td>{state.city}</td>
        <td>{state.email}</td>
        <td>
            {event:rowClick, action:'edit'}
            <button action="edit">{'edit'}</button>
            {event:rowClick, action:'delete'}
            <button action="delete" hidden={!USER.isAdmin()}>{'delete'}</button>
        </td>
    </tr>
</tbody>
</table>

variants
<tr x-click={{id:state.id}} event="rowClick">
<tr x-click={state.id}} event="rowClick">
<tr x-click={state.$value}} event="rowClick">

function variants
<button x-click={this.navigateBack()}>{'back'}</button>
event and action parameters will be provided
event: dom event like click
       action if changed by child node
<button x-click={(evt,action)=>{this.navigateBack()}>{'back'}</button>



```
