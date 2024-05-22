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

	off(event, listener) {
		if (!this.events[event]) {
			return this;
		}
		this.events[event] = this.events[event].filter(
			({listener: eventListener}) => eventListener !== listener
		);
	}

	emit(event, ...args) {
		const listeners = this.events[event];
		if (listeners) {
			listeners.forEach(({listener}) => listener(...args));
		}
	}
}

export default EventEmitter;