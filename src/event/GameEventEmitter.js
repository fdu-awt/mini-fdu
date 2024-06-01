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
	KEY_DOWN_T: Symbol("key_down_t"),
	KEY_UP_W: Symbol("key_up_w"),
	KEY_UP_A: Symbol("key_up_a"),
	KEY_UP_S: Symbol("key_up_s"),
	KEY_UP_D: Symbol("key_up_d"),
	// 申请鼠标控制（鼠标解锁）
	REQUEST_MOUSE_CONTROL: Symbol("request_mouse_control"),
	// 申请键盘控制
	REQUEST_KEYBOARD_CONTROL: Symbol("request_keyboard_control"),
});

class GameEventEmitter extends EventEmitter {
	constructor() {
		super();
	}

	/**
	 * @description 申请所有控制（解锁鼠标，解锁键盘）
	 * */
	requestAllControl() {
		// 申请解除鼠标锁定
		this.emit(GAME_EVENTS.REQUEST_MOUSE_CONTROL);
		// 申请接触键盘锁定
		this.emit(GAME_EVENTS.REQUEST_KEYBOARD_CONTROL);
	}
}

export { GAME_EVENTS };
export default new GameEventEmitter();