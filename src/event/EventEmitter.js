class EventEmitter {
	constructor() {
		this.events = {};
	}

	on(event, listener) {
		if (!this.events[event]) {
			this.events[event] = [];
		}
		this.events[event].push(listener);
	}

	emit(event, ...args) {
		const listeners = this.events[event];
		if (listeners) {
			listeners.forEach(listener => listener(...args));
		}
	}
}

export default EventEmitter;