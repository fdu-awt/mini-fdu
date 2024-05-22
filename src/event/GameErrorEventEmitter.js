const GAME_ERROR_EVENTS = Object.freeze({
	NO_LOCAL_USER_ID: Symbol("no_local_user_id"),
	// 其他错误
	OTHER_ERROR: Symbol("other_error"),
});

class GameErrorEventEmitter {
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

export { GAME_ERROR_EVENTS };
export default new GameErrorEventEmitter();
