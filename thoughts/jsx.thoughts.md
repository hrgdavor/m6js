
## Booleans, Null, and Undefined Are Ignored (React does this)

false, null, undefined, and true are valid children. They simply don’t render. These JSX expressions will all render to the same thing:

```html
<div />
<div></div>
<div>{false}</div>
<div>{null}</div>
<div>{undefined}</div>
<div>{true}</div>
```
