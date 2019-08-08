

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
both `let` and `const`
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

`var` is scoped to the function, so it is visible, `let`, `const` also work here, and if declared once, behave same as var

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

