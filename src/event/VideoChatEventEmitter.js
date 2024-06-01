import EventEmitter from "@/event/EventEmitter";

const VIDEO_CHAT_EVENTS = Object.freeze({
	START: Symbol("start_video_chat"),
	// 拒绝他人的视频聊天
	REJECT: Symbol("video_reject"),
	// 视频聊天被拒绝
	REJECTED: Symbol("video_rejected"),
	// 自己结束视频聊天
	SELF_END: Symbol("self_end_video_chat"),
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