# Autocomplete

- `mode` 
  - **text** - text items (displayed values are the same as value returned)
  - **entitity** - object values 
- `id_column` - used in `mode:entity` for getValue/setValue
  - default: `id`

- `name_column` - used in `mode:entity` for display (unless a custom template is provided)
  - default: `name`

- `tpl` - template for each item shown
  - `mode:text` default template shows the text
  - `mode:entity` default template shows the name
- limit` - max items shown
- `delay` - wait number of ms after last key typed to start filtering the list
- `readonly` - no change allowed
- `required` - does not allow empty value
  - if there is only one value available, it becomes `readonly`
- `empty_text` - text to display when empty (not used if `required` )
- `show_all` - display all items, but highlight first match
  - useful for shorts list like: `[Yes,No,All]` etc.
- `no_clear` **CSS** - hide the `X` button (targeted by css)
- `typing_filter` - transform text on `blur` (before parsing the date)
- `parser` - parser function that transforms text to date
- `formatter` - formatter function that displays current value


API

- `setValue` - accepts:
  - timestamp 
  - Date object
  - String that Date can parse
- `getValue` - returns Date object or null if empty
- `formatValue` - formats the value
- `fixTypedValue` - 

supported filters:
 - in
 - out 

specific directives thet work with autocomplete 

- `x-in`  -  for `setValue` - transforms value before calling the original `setValue` (the input)
- `x-out`  -  for `getValue` - transforms the returned value (the output)
- `x-typing` - transform typed value

## number of items shown

**huge list loaded async** 

- loaded from database or form some other source

- show `limit` max items

- define min characters to start searching 

  - 0 - starts immediately and also shows items on `focus` 
