# x-click

# introduction and basic usage

This directive is a nice alternative to capturing `onclick` event, as it enables you to make an element clickable but implements some extra useful logic that you would otherwise implement in event handler.

- can be disabled via `disabled` attribute (which can then also be targeted by CSS and styled)
- ignores `doubleclick`
- offers some more advanced usage as well

The basic usage:

```jsx
<button x-click={this.saveDocument()}>{'save'}</button>
```

if `disabled` attribute is present, click is ignored

```jsx
<button x-click={this.saveDocument()} disabled>{'save'}</button>
```

and you can easily style the disabled element using: `[disabled]` CSS selector (for example: `[disabled]{color:gray;}`)



# how it works

The `x-click` directive works by catching `onclick` event on the element and all of it's children. This means that it can also be used to handle multiple clickable elements with single instance of `x-click`.

To enable advanced behaviour for multiple clickable elements the directive is looking for 3 DOM attributes that further customize the behaviour. 

- `event` - defines name of the event to fire on the component 
  - value from the `x-click` is used as context (example: `x-click={state.id}`)
  - alternatively  `x-click event="eventName"` can be shortened to  `x-click="eventName"` 
- `action` - optional distinction needed for cases when multiple elements are clickable with slightly different result (example: `changeLanguage` but different language code for each button) 
- `disabled` - disables the execution(click does nothing)

Using attributes for these customizations is intentional as it also provides a nice CSS target for styling.

If an attribute is present on multiple levels the most inner child's value has the priority.

# call a method

If value for `x-click` is an JSX expression

```html
<button x-click={this.showDataTable()}>{'show_data'}</button>
```
it is good to keep this in mind: JSX parser will actually wrap the above in arrow function:

```html
<button x-click={()=>this.showDataTable()}>{'show_data'}</button>
```

so the code will not be evaluated during render, but passed as code wrapped in arrow function that can be evaluated when needed.

It is important to remember that if `x-click` is a function like above, it will always be executed (unless when `disabled`  attribute is present in clicked area).

## 1) call a method and use original DOM event and action

```html
<button x-click={(evt,action)=>this.showDataTable(evt.target,action)}>
    {'show_data'}
</button>
```

The 2 parameters are always provided when calling the function that is part of JSX expression in the value of `x-click`. 

In case no function wrapper was added in the code, the default behaviour of JSX parser will be to add a wrapper around it anyways.

## 2) call a method  with parameter

```html
<div>
    Choose language: 
    <button x-click={this.changeLanguage('en')}>{'en'}</button>
    <button x-click={this.changeLanguage('de')}>{'de'}</button>
</div>
```

## 3) call  method with multiple clickable elements and different action

```html
<div x-click={(evt,action)=>this.changeLanguage(action)}>
    Choose language:
    <button action="en">EN</button>
    <button action="hr">HR</button>
</div>
```
it is important to check if action has value, because user can click somewhere outside the buttons and then the action is undefined. The check can be done inline in the JSX, but also can be inside `changeLanguage`  function so the JSX looks a bit cleaner. It is your choice on where the check is, but it is important to have it.

implement the check in JSX:
```html
<div x-click={(evt,action)=>{if(action) this.changeLanguage(action)}}>
```
implement the check  in the function implementation

```js
function changeLanguage(lang){
    if(!lang) return;
    // ...
}
```

The same situation can happen when firing an event with multiple clickable elements and different action, but then the only choice is to implement the check inside event handler.

# events (fire/catch)

## catching events

events are caught by implementing `on_eventName(event){...}` method for the component 

- `save` is caught by implementing `on_save(event){...}`
- `deleteUser` is caught by implementing `on_deleteUser(event){...}`

## event defaults

`{required:true, direction:'parent'}`

- `required: true` - force event handling code to throw error if no handler is found
- `direction:'parent'` - utility containers like loops, tables or layout utilities should forward the event down 
  - because those containers are used inside a Component's template and intention is for component (who's template we are writing at the moment) to catch the event.
- `action:` - is not defined and can be defined  by adding attribute: `action="whatever"`

## 1) fire `save` event 

```html
<button x-click="save">{'save'}</button>
```
 caught by implementing `on_save(event){...}`

- event: `{name:'save'}`

## 2) fire `edit` event with context

action is left as an attribute and value is not caught in any way before applying the attribute's value, so it can only be string. If other value type is needed like numeric or complex object, then context mode can be used.

```html
<button x-click={state.id} event="edit">{'edit'}</button>
```

 caught by implementing `on_edit(event){...}`

- sample state: `{id:12}`
- event: `{name:'edit', context:12}`


## 3) fire `changeLanguage` event with custom `action`

```html
<button x-click="changeLanguage" action="en">{'en'}</button>
<button x-click="changeLanguage" action="de">{'de'}</button>
```
 caught by implementing `on_ChangeLanguage(event){...}`

- button1 event: `{name:'changeLanguage', action='en'}`
- button2 event: `{name:'changeLanguage', action='de'}`

## 4) fire `changeLanguage` event with multiple clickable elements and different `action` 

```html
<div x-click="changeLanguage">
    Choose language:
    <button action="en">{'en'}</button>
    <button action="de">{'de'}</button>
</div>
```
 caught by implementing `on_ChangeLanguage(event){...}`

- button1 event: `{name:'changeLanguage', action='en'}`
- button2 event: `{name:'changeLanguage', action='de'}`

it is important to check if action has value inside `on_changeLanguage`  function, because user can click somewhere outside the buttons and then the action is undefined.

```js
function changeLanguage(lang){
    if(!lang) return;
    // ...
}
```


# ------ ----- brainstorm ----- -----

# draft complex examples

buttons (previously done with button component). 

- keep: old fire to parent concept could be useful within tables, loops

```html
<div x-click class="buttonsArea" event="done">
    {event:done, action:save}
    <button action="save">{'save'}</button>

    click should not work if element is disabled
    {event:done, action:delete}
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
<tr x-click={(evt,action)=>this.rowClick(state.id, action)}}>

function variants
<button x-click={this.navigateBack()}>{'back'}</button>
event and action parameters will be provided
event: dom event like click
       action if changed by child node
<button x-click={(evt,action)=>{this.navigateBack()}>{'back'}</button>



```



# random thoughts / ideas

## implementation thoughts:

- If `x-click` value is jsx expression, it will evaluate to a function.

- in case value is function, the function will always be executed with 2 params: `func(domEvent,action)` this way putting custom code in to `x-click` will be executed with those 2 parameters and can be used if needed

## potential conflict situation: missing event-name

unlikely an issue, but thought of

in case `x-click` expression is used to provide context for event and no event-name was found

- it means no event will be fired as expected
- but `x-click` function must be evaluated as this is a use-case for putting a custom method call into `x-click`  
- if generating context value has no side-effects, then this behaviour is not problematic

