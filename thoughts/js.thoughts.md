# jsx centric component approach

there are some benefits of inspecting the template definition before applying to HTML. Because
some expressions can provide complex objects and attribute values must be strings, it is then
better to catch those values instead of applying them to HTML and reading from HTML afterwards

  - template definition is generated for each instance so it can include reference to that component's `state`
  - component is applying JSX definition and can modify if it as well
  - component can remove any attribute and use it only as parameter, thus not rendering it (it is done by deleting the key from attr object)
  - component can choose to leave some the defined:attributes for updating actual html:attributes, but use others in different manner
    - by default direct attributes expect refresh on parent state change, s
      - a) parent will call parentStateChanged (useful for possible removing components, thus remo)
      - b) could be implemented as listener (child adds listener for parent's stateChange event)
      - c) parent keeps updaters for itself (removing component could also check that array to see if some updaters can be removed)
    - child attributes expected to change on own state
  - 
  - instead of array of updaters in component itself (how it is in mi2JS)
    - attribute definition is instance of Updater
    - list of updaters is composed later after component decides to maybe remove/replace some of them

# consider leaving path open for server side generation
 
non-goal but maybe useful if considered, and does not affect usability in a big way.

A clean separation of logic that generates HTML and logic that adds interaction
could allow some code base to be usable as geenrated.

Could be a specific coding style that accepts some compromises, unlike full feature usage.

# component id
each created component gets id from internal sequence, and is assigned to the dom node
 - use for dev only
 - can enable check if multiple components are created on node
 - array could be maintained with references
 - quick way to find component for a specific node without direct reference
 - the ref array could be used to generate stats regarding instance count per type ... etc.

#js thoughts

# component/node collections
  - coded(object key/value) / array 
  - form elements
  - tab buttons 
  - tab & navigation content (order not important, can be removed from dom and returned instad of hide)

navigation can have two different components to show versus to forward data,
and it is usually when there are some extra elements around that component to be shown a well (title, or extra buttons)
    - use 2 separate collections and assume one is default (this.$content + $this.$area)
    - or use some marking to signify that show/hide is not same as the navigation component 

forms can also have this dual situation where show/hide differs from getValue/setValue.
because you want to show hide the whole section with the label (not just the input)

there are some situations where one component should be part of multiple collections
 -- TODO find example(can't remember right now)


#html functions

```js
j6x.html.register('attr', function(){
    
});

```
# define rules inside JSX
define rules for JSX parser to facilitate different useful cases

 - when expression is placed inside a lambda or not (it needs recalculation)
 - derived values from state
 - maybe null resilient object value extraction (state.?vessel.?name)
 - different types of content (Loop - uppercase tag name calls function like React does)
   the function returns something that is handled differently 
   (compoentnt definition instead of just JSX )

# events
fireEvent: callback
  - if there is a callback, values are collected from each handler
  - list of event handlers(that were called) is returned
  - this allows colector events
  - x-click directive can check if any handler was called to warn of possible typos (if no handler was called)

# event handlers
```html
<button onclick={this.save(event)}></button>
```
if wrapper is added, forward the event object

<button onclick={(event)=>{this.save(event)}}></button>


# replacement for button component

```html
// mi2JS
<button as="base/Button" event="changeLanguage" action="hr"></button>
// action is row id (primary key from some table row)
<tr as="base/Button" action="1" event="edit">
  <td>{name}</td>
  <td>{lastName}</td>
  <td>
    <button event="edit">[[edit]]</button></td>
    <button event="view">[[view]]</button></td>
    <button event="delete" class="delete">[[delete]]</button>
  </td>
</tr>
```

more suitable do be a directive that can listen to click events and fire the event to 
the component where this tempalte code is (the button in mi2JS did just that, but was an actual component)

 - support for disabled attribute
 - the logic of choosing event name and action data is already there
 - expand to allow more data
 - intercept JSX maybe to allow for data other than strings as event data


# inline loop JSX
```html
<table>
  <tbody as="base/Loop" p="userLoop">
    {mi2.inline((state)=>(
      <tr as="Base">
        <td>
          {state.tonnage}
        </td> 
        <td>
          {state.name}
        </td>
      </tr>
    ))}
  </tbody>
</table>
```


# loop without parent

create single element as placeholder (TextNode) to insert elements before it

```html
{mi2.loop(()=>state.users,
  (user={})=(
    <label>{user.name}</label>
  )
)}

<Loop src={state.users}>
{mi2.simple((user={})=>(
  <label>{user.name}</label>
))}
</Loop>

<Loop src={state.users}>{(user={})=>(
  <label>{user.name}</label>
)}</Loop>

<Loop src={state.users} tpl={
    (user={})=><label>{user.name}</label>
}/>

<Loop src={state.users} tpl={(user={})=><label>{user.name}</label>}/>

```

# loop with inline jsx

```html

// *************** contemplating syntax ********************

// ugly
<Loop src={state.users}>{(user={})=><div>
        <label>{user.name}</label>
        <span>{user.note}</span>
    </div>
}</Loop>

// nice
<Loop src={state.users}>
{(user={})=>(
    <div>
        <label>{user.name}</label>
        <span>{user.note}</span>
    </div>
)}
</Loop>

// compact 1
<Loop src={state.users} tpl={
    (user={})=><div>
        <label>{user.name}</label>
        <span>{user.note}</span>
    </div>
}/>

// compact 2 - ***** PREFERED *******
<Loop src={state.users} tpl={(user={})=>(
    <div>
        <label>{user.name}</label>
        <span>{user.note}</span>
    </div>
)}/>

// supercompact for very simple stuff
<Loop src={state.users} tpl={(user={})=><label>{user.name}</label>}/>






```
