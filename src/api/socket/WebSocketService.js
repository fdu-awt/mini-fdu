/**
 * 通用的 WebSocket 服务类
 * */
class WebSocketService {
	constructor(url) {
		this.url = url;
		this.socket = null;
		this.eventHandlers = {};
	}

	connect(userId) {
		console.log("WebSocket connecting...");
		console.log("WebSocket URL:", `${this.url}/${userId}`);
		this.socket = new WebSocket(`${this.url}/${userId}`);

		this.socket.onopen = (event) => {
			console.log("WebSocket connection established");
			if (this.eventHandlers.open) {
				this.eventHandlers.open(event);
			}
		};

		this.socket.onmessage = (event) => {
			console.log("WebSocket message received:", event.data);
			const message = JSON.parse(event.data);
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
}

export default WebSocketService;
