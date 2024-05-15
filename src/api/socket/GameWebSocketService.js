import WebSocketService from "@/api/socket/WebSocketService";

/**
 * 处理Game中玩家位置、模型、动作等信息的同步
 * */
class GameWebSocketService extends WebSocketService{
	constructor() {
		super(process.env.VUE_APP_GAME_WEBSOCKET_BASE_URL);
	}
}

export default GameWebSocketService;