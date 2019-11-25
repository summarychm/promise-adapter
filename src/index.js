const Promise = require("./core/promise");

const resolved = (value) => Promise.resolve(value);
const rejected = (reason) => Promise.reject(reason);
const deferred = () => {
	let promise, resolve, reject;
	promise = new Promise(($resolve, $rejected) => {
		resolve = $resolve;
		reject = $rejected;
	});
	return { promise, resolve, reject };
};
module.exports = { resolved, rejected, deferred };
