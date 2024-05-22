import EventEmitter from "@/event/EventEmitter";

const GAME_EVENTS = Object.freeze({
	USER_SELF_IMAGE_CHANGE: Symbol("user_self_image_change"),
});

class GameEventEmitter extends EventEmitter {
	constructor() {
		super();
	}
}

export { GAME_EVENTS };
export default new GameEventEmitter();