const toString = Object.prototype.toString;

function isObject(obj) {
	return toString.call(obj) === "[object Object]";
}

function isFunction(obj) {
	return toString.call(obj) === "[object Function]";
}

function isPromise(obj) {
	return obj instanceof Promise;
}

function isThenable(obj) {
	return (isObject(obj) || isFunction(obj)) && "then" in obj;
}

module.exports = {
	isObject,
	isFunction,
	isPromise,
	isThenable,
};
