const toString = Object.prototype.toString;
// export
function isObject(obj) {
	return toString.call(obj) === "[object Object]";
}
// export
function isFunction(obj) {
	return typeof obj === "function";
	// return toString.call(obj) === "[object Function]";
}
// export
function isPromise(obj) {
	return obj instanceof Promise;
}
// export
function isThenable(obj) {
	return (isObject(obj) || isFunction(obj)) && "then" in obj;
	// return (isObject(obj) || isFunction(obj)) && "then" in obj;
}

module.exports = {
	isObject,
	isFunction,
	isPromise,
	isThenable,
};

// var func = () => {};
// var result = isFunction(func);
// console.log(result);
