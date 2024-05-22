import EventEmitter from "@/event/EventEmitter";

const GAME_EVENTS = Object.freeze({
	USER_SELF_IMAGE_CHANGE: Symbol("user_self_image_change"),
	KEY_DOWN_W: Symbol("key_down_w"),
	KEY_DOWN_A: Symbol("key_down_a"),
	KEY_DOWN_S: Symbol("key_down_s"),
	KEY_DOWN_D: Symbol("key_down_d"),
	KEY_DOWN_V: Symbol("key_down_v"),
	KEY_DOWN_E: Symbol("key_down_e"),
	KEY_DOWN_Q: Symbol("key_down_q"),
	KEY_DOWN_Z: Symbol("key_down_z"),
	KEY_UP_W: Symbol("key_up_w"),
	KEY_UP_A: Symbol("key_up_a"),
	KEY_UP_S: Symbol("key_up_s"),
	KEY_UP_D: Symbol("key_up_d"),
	// 申请鼠标解锁
	REQUEST_POINTER_UNLOCK: Symbol("request_pointer_unlock"),
	// 申请打字控制
	REQUEST_CHAT_CONTROL: Symbol("request_chat_control"),
});

class GameEventEmitter extends EventEmitter {
	constructor() {
		super();
	}
}

export { GAME_EVENTS };
export default new GameEventEmitter();