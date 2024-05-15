import WebSocketService from "@/api/socket/WebSocketService";

/**
 * GameWebSocketService 中可以接收的message事件常量
 * */
const GAME_WS_MSG_TYPES = Object.freeze({
	REMOTE_DATA: Symbol("remoteData"),
	// 其他错误
	REMOTE_PLAYER_DELETED: Symbol("deletePlayer"),
});
/**
 * GameWebSocketService 中可以发送的事件常量
 * */
const GAME_WS_EMIT_EVENTS = Object.freeze({
	LOCAL_UPDATE: Symbol("local_update"),
});

/**
 * 处理Game中玩家位置、模型、动作等信息的同步
 * */
class GameWebSocketService extends WebSocketService{
	constructor() {
		super(process.env.VUE_APP_GAME_WEBSOCKET_BASE_URL);
		this.messageHandlers = {};
		this.eventHandlers.message = (message) => {
			const messageType = Object.keys(GAME_WS_MSG_TYPES).find(key => GAME_WS_MSG_TYPES[key].description === message.type);
			const handler = this.messageHandlers[GAME_WS_MSG_TYPES[messageType]];
			if (handler) {
				handler(message);
			}
		};
	}

	/**
	 * 添加消息处理器
	 * @param {Symbol} type 消息类型 必须是 GAME_WB_MSG_TYPES 中的值
	 * @param {Function} handler 消息处理器
	 * */
	onMessage(type, handler) {
		if (this.messageHandlers[type]) {
			throw new Error("Message handler already exists");
		}
		// 如果 type 不是 GAME_WS_MSG_TYPES 中的值，则抛出异常
		if (!Object.values(GAME_WS_MSG_TYPES).includes(type)) {
			throw new Error("Invalid message type: " + type.toString());
		}
		this.messageHandlers[type] = handler;
	}

	on(event, handler) {
		if (event === "message") {
			throw new Error("Use onMessage() to handle messages");
		} else {
			super.on(event, handler);
		}
	}

	/**
	 * 通过 WebSocket 发送消息
	 * @param {Symbol} event 事件类型, 必须是 GAME_WS_EMIT_EVENTS 中的值
	 * @param {Object} data 消息数据
	 * */
	gameEmit(event, data) {
		if (!Object.values(GAME_WS_EMIT_EVENTS).includes(event)) {
			throw new Error("Invalid event type" + event);
		}
		super.emit(event.description, data);
	}
}

export default GameWebSocketService;
export { GAME_WS_MSG_TYPES, GAME_WS_EMIT_EVENTS };