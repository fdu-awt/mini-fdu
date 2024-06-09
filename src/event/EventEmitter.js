import _ from 'lodash';

class EventEmitter {
	constructor() {
		this.events = {};
	}

	on(event, listener) {
		if (!this.events[event]) {
			this.events[event] = [];
		}
		// 将监听器和它的引用存储在数组中
		this.events[event].push({listener});
		return this; // 返回EventEmitter实例，以便链式调用
	}

	/**
	 * @description 为指定事件防抖的监听器
	 * */
	onWithDebounce(event, listener, delay) {
		const debouncedListener = _.debounce(listener, delay);
		return this.on(event, debouncedListener);
	}

	/**
	 * @description 为指定事件节流的监听器
	 */
	onWithThrottle(event, listener, delay) {
		const throttledListener = _.throttle(listener, delay);
		return this.on(event, throttledListener);
	}

	off(event, listener) {
		if (!this.events[event]) {
			return this;
		}
		this.events[event] = this.events[event].filter(
			({listener: eventListener}) => eventListener !== listener
		);
		return this;
	}

	emit(event, ...args) {
		const listeners = this.events[event];
		if (listeners) {
			listeners.forEach(({listener}) => listener(...args));
		}
	}
}

export default EventEmitter;