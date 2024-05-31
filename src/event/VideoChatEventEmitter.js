import EventEmitter from "@/event/EventEmitter";

const VIDEO_CHAT_EVENTS = Object.freeze({
	START: Symbol("start_video_chat"),
	REJECTED: Symbol("video_rejected"),
	END: Symbol("end_video_chat"),
	INVITE: Symbol("invite_video_chat"),
});

class VideoChatEventEmitter extends EventEmitter {
	constructor() {
		super();
	}
}

export { VIDEO_CHAT_EVENTS };
export default new VideoChatEventEmitter();