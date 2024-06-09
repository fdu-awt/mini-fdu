class ChatWebSocketService {
	constructor(userId) {
		this.userId = userId;
		this.url = process.env.VUE_APP_CHAT_WEBSOCKET_BASE_URL;
		this.socket = null;

	}
	connect() {
		const socket_url = `${this.url}/${this.userId}`;
		this.socket = new WebSocket(socket_url);
		this.socket.onopen = () => {
			console.log("WebSocket connection established");
		};
		this.socket.onclose = () => {
			console.log("WebSocket connection closed:");
		};

		this.socket.onerror = (error) => {
			console.error("WebSocket error:", error);
		};

	}
	close(){
		this.socket.close ();
	}

}
export default ChatWebSocketService;
