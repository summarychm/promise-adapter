const { isFunction, isObject, isThenable, isPromise } = require("../utils");
const PENDING = Symbol("pending");
const FULFILLED = Symbol("fulfilled");
const REJECTED = Symbol("rejected");

class Promise {
	/** Promise初始化函数,接收一个包含resolve[&reject?]的执行器函数
	 * @param {function} exector 执行器函数,依赖翻转,由调用者择机resolve/reject
	 */
	constructor(exector) {
		this.state = PENDING;
		this.result = null;
		/** 存储新旧promise切换所需的数据,{onFulfilled(当前),onRejected(当前),resolve(新promise),reject(新promise)} */
		this.handlers = [];

		/**  */
		let onFulfilled = (value) => transition(this, FULFILLED, value);
		let onRejected = (reason) => transition(this, REJECTED, reason);

		try {
			/** 保证state只变更一次 */
			let ignore = false;
			/** promise的resolveFn */
			let resolveFn = (value) => {
				if (ignore) return;
				ignore = true;
				resolveValueToPromise(this, value, onFulfilled, onRejected);
			};
			/** promise的rejectFn */
			let rejectFn = (reason) => {
				if (ignore) return;
				ignore = true;
				onRejected(reason);
			};
			//! 执行器函数
			exector(resolveFn, rejectFn);
		} catch (error) {
			reject(error);
		}
	}

	/**
	 * 构造新promise的result
	 * @param {*} onFulfilled
	 * @param {*} onRejected
	 */
	then(onFulfilled, onRejected) {
		return new Promise((resolve, reject) => {
			// 将promise切换所需的数据存储到handlers中
			this.handlers.push({ onFulfilled, onRejected, resolve, reject });
			this.state !== PENDING && handleCallbackAll(this);
		});
	}
	catch(onRejected) {
		return this.then(null, onRejected);
	}

	static resolve = (value) => new Promise((resolve) => resolve(value));
	static reject = (reason) => new Promise((resolve, reject) => reject(reason));
}

/** 处理 resolveValue 的边界值,并将结果传递给新promise
 * @param {*} promise promise实例
 * @param {*} result resolve的返回值
 * @param {*} onFulfilled resolve回调
 * @param {*} onRejected reject回调
 */
function resolveValueToPromise(promise, result, onFulfilled, onRejected) {
	if (result === promise) return onRejected(new TypeError("promise循环引用自身"));
	// 如果result为promise,则通过.then将onFulfilled和onRejected注册到result上.
	else if (isPromise(result)) return result.then(onFulfilled, onRejected);
	// 如果result为thenable,将result.then的this绑定为result,将result.then用newPromise包裹
	else if (isThenable(result)) {
		try {
			let then = result.then;
			if (isFunction(then)) return new Promise(then.bind(result)).then(onFulfilled, onRejected);
		} catch (error) {
			return onRejected(error);
		}
		// result为其他情况则直接传入onFulfilled处理
	}
	return onFulfilled(result);
}

/** 更新promise实例(state和value)并顺序执行then绑定的callback
 * @param {any} promise promise实例
 * @param { FULFILLED / REJECTED} state 要更新为的state
 * @param {any} value 要更新为的value
 */
function transition(promise, state, result) {
	if (promise.state !== PENDING) return;
	promise.state = state;
	promise.result = result;
	handleCallbackAll(promise);
}

/** 异步调用promise.then绑定的callback(微任务/setTimeout)
 * @param {promise} promise promise实例
 */
function handleCallbackAll(promise) {
	setTimeout(() => {
		let { handlers, state, result } = promise;
		while (handlers.length) handleCallback(handlers.shift(), state, result);
	}, 0);
}

/** 执行then回调,在当期promise和新promise间进行状态传递
 * @param {handler} handler 回调对象集合
 * @param {state} state promise最新的state
 * @param {obj} result 最新的result
 */
function handleCallback(handler, state, result) {
	let { onFulfilled, onRejected, resolve, reject } = handler;
	try {
		// 如果
		if (state === FULFILLED) {
			// 调用then注册的onFulfilled函数,并将返回值包装为新promise.resolve值返回
			isFunction(onFulfilled) ? resolve(onFulfilled(result)) : resolve(result);
		} else if (state === REJECTED) {
			// 调用then注册的onRejected函数,并将返回值包装为新promise.resolve值返回
			isFunction(onRejected) ? resolve(onRejected(result)) : reject(result);
		}
	} catch (error) {
		reject(error);
	}
}

module.exports = Promise;
