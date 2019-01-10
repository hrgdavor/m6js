
# useful boolean attributes in html
  - disabled
  - required
  - selected
  - checked
  - readOnly
  - open

# support remove hidden nodes from DOM
 - configurable mode of operation
 - switch in runtime for a subtree (remove/restore nodes)

# components vs containers distinction

general
  - component: without direct dom node
  - container: has DOM node
  - utility method to get first component with node 
    - can be the fisrt component or a child in some level
    - problem if container has more than one such component
  - utility method to get first component with node

!!! posibility of multiple top level child DOM nodes
  - maybe limit container to single child
  - maybe assume DOM operations like hiding to operate on array of nodes
    - 
```html

<input name="user" />

<select as={Input} name="user" />


<Group name="buttons" slect={state.currentTab}>
    <button key="users">{'users'}</button>
    <button key="settings">{'settings'}</button>
    <button key="reports">{'reports'}</button>
</Group>

<Group name="buttons" slect={state.currentTab}>{{
    users: <button>{'users'}</button>
    settings: <button>{'settings'}</button>
    reports: <button>{'reports'}</button>
}}</Group>

{
    buttons.selectedIs('settings');
    buttons.forThe('settings', (item,isIn)=>item.setSelected(isIn));
}
```


state change (collection of compoennts to refresh), and component refresh after (on next animation frame)
```js
var __nextUpdate = 1;
var updateList = [];
var dirtyList = [];

component.__nextUpdate = 0;

# set state -> register for update
component.__nextUpdate = 1; // new value
updateList.push(component);

# set state -> register for update
component.__nextUpdate = 1; // same
# skip: updateList.push()

# requestAnimationFrame and then: 
for(... updateList){
    perform update
}
__nextUpdate = 2; // ++
updateList = [];


```

## visibility
  - not part of state to avoid triggerring update 
    - has special global handling, DOM updates are not trigerred when not visible with parent
    - dom node could be removed
  - on_init, on_show, on_hide
  - visible
  - parentVisible (trigered by visible, updated while checking if init/show/hide should be fired)
    - 


## state

global state automatically has each component state
 - __instanceId
 - some have path from root (for navigation)


## navigation link problem
  - navigation link value available ony when parent is visible, and thus has 
    own navigation link defined, so we can use it as prefix and even resolve relative paths
  - !idea! onmousedown can be used to udpate link before clicking
```html
<div>
    <a href="#/home">Home</a>
    <Link href="#subpage">subpage</Link>
</div>
```
