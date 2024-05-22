/**
 * 通用的 WebSocket 服务类 <br/>
 *
 * 用法示例： <br/>
 * const ws = new WebSocketService("ws://localhost:8080/ws"); <br/>
 * ws.on("open", (event) => {}); <br/>
 * ws.on("message", (message) => {}); <br/>
 * ws.on("close", (event) => {}); <br/>
 * ws.on("error", (error) => {}); <br/>
 * ws.connect(userId); <br/>
 * */
class WebSocketService {
	constructor(url) {
		this.url = url;
		this.socket = null;
		this.currentMessage=null;
		this.eventHandlers = {};
	}

	connect(userId) {
		console.log("WebSocket connecting...");
		const socket_url = `${this.url}/${userId}`;
		console.log("WebSocket URL:", socket_url);
		this.socket = new WebSocket(socket_url);

		this.socket.onopen = (event) => {
			console.log("WebSocket connection established");
			if (this.eventHandlers.open) {
				this.eventHandlers.open(event);
			}
		};

		this.socket.onmessage = (event) => {
			console.debug("WebSocket message received:", event.data);
			const message = JSON.parse(event.data);
			this.currentMessage=message;
			if (this.eventHandlers.message) {
				this.eventHandlers.message(message);
			}
		};

		this.socket.onclose = (event) => {
			console.log("WebSocket connection closed");
			if (this.eventHandlers.close) {
				this.eventHandlers.close(event);
			}
		};

		this.socket.onerror = (error) => {
			console.error("WebSocket error:", error);
			if (this.eventHandlers.error) {
				this.eventHandlers.error(error);
			}
		};
	}

	sendMessage(message) {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify(message));
		} else {
			console.error("WebSocket is not open");
		}
	}

	on(event, handler) {
		this.eventHandlers[event] = handler;
	}

	/**
	 * @param {String} event 事件类型
	 * @param {Object} data 事件数据
	 * */
	emit(event, data) {
		const message = {
			type: event,
			data: data,
		};
		this.sendMessage(message);
	}
}

export default WebSocketService;
