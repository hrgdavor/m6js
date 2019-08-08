

## NONO for `let`, `const,` but `var` does not care

both `let` and `const`
```js
function x(){
	const a = 1;
	console.log(a);
	const a = 2;
	console.log(a);
}
x();
/* Uncaught SyntaxError: Identifier 'a' has already been declared */ 
```
`var` does not care about duplicate declaration (it is still not wise to do it, and it is good that `let` and `const` are more strict in this regard)

```js
function x(){
	var a = 1;
	console.log(a);// 1
	var a = 2;
	console.log(a);// 2
}
x();
```



## `var`  <> `let`,`const`

both `let` and `const`

```js
function x(){
	const a = 1;
	console.log(a);// 1
	if(a==1){
		const a = 2;
		console.log(a);// 2
	}
	console.log(a);// 1	<------------ difference
}
x();
```

`var` is scoped to function, not the block

```js
function x(){
	var a = 1;
	console.log(a);// 1
	if(a==1){
		var a = 2;
		console.log(a);// 2
	}
	console.log(a);// 2	<------------- difference
}
x();
```

## `var`, `let`, `const`

`var` is scoped to the function, so it is visible. `let`, `const` also work here instead. Because in this case, since  variable is declared only once, they behave the same way as `var` .

```js
function x(){
	if(true){
		var a = 2;
		console.log(a);// 2
	}
	console.log(a);// 2
}
x();
```

