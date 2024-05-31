<script>
import videoChatService from "@/api/socket/VideoChatService";
import store from "@/store";

export default {
	name: "VideoChatDemo",
	mounted() {
		this.init();
	},
	methods: {
		init() {
			const startButton = document.getElementById('startButton');
			const hangupButton = document.getElementById('hangupButton');
			// 本机演示，需要使用不同的 userId 以在一个浏览器中模拟不同的用户
			const userId = store.getUserId();
			let toId = userId + 1;
			store.setUserId(userId + 1);
			const localVideo = document.getElementById('localVideo');
			const remoteVideo = document.getElementById('remoteVideo');
			startButton.addEventListener('click', () => {
				videoChatService.invite(toId, localVideo, remoteVideo);
			});
			hangupButton.addEventListener('click', () => {
				videoChatService.hangup();
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
		<button id="hangupButton">挂断</button>
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