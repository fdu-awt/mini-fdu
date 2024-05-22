const API_ERROR_EVENTS = Object.freeze({
	UN_AUTH: Symbol("un_authorized"),
	VALIDATE_ERROR: Symbol("validate_error"),
	INTERNAL_ERROR: Symbol("internal_error"),
	NETWORK_ERROR: Symbol("network_error"),
	// 其他错误
	OTHER_ERROR: Symbol("other_error"),
});

class ApiErrorEventEmitter {
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

export { API_ERROR_EVENTS };
export default new ApiErrorEventEmitter();
