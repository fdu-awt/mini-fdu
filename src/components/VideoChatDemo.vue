<script>
import VideoChatService from "@/api/socket/VideoChatService";
import store from "@/store";

export default {
	name: "VideoChatDemo",
	mounted() {
		this.init();
	},
	methods: {
		init() {
			const startButton = document.getElementById('startButton');
			const localVideo = document.getElementById('localVideo');
			const remoteVideo = document.getElementById('remoteVideo');
			const signalingServerUrl = process.env.VUE_APP_VIDEO_CHAT_WEBSOCKET_BASE_URL;
			const userId = store.getUserId();
			// TODO 如果本机演示，需要使用不同的 userId
			// store.setUserId(userId+1);
			const videoChatService = new VideoChatService(localVideo, remoteVideo, signalingServerUrl, userId);
			startButton.addEventListener('click', () => {
				videoChatService.start();
			});
		},
	},
};
</script>

<template>
	<div class="video-container">
		<video id="remoteVideo" autoplay playsinline></video>
		<video id="localVideo" autoplay playsinline></video>
		<button id="startButton">开始视频聊天</button>
	</div>
</template>

<style scoped>
.video-container {
	position: relative;
	width: 100%;
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: white;
	z-index: 999;
}

#localVideo {
	position: absolute;
	top: 10px;
	right: 10px;
	width: 200px;
	height: auto;
	border: 2px solid #ccc;
}

#remoteVideo {
	width: 80%;
	height: auto;
	border: 2px solid #ccc;
}
</style>