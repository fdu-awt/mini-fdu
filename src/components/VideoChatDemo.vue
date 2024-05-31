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
		<div class="button-container">
			<el-button id="startButton" type="primary">开始视频聊天</el-button>
			<el-button id="hangupButton" type="danger">挂断</el-button>
		</div>
	</div>
</template>

<style scoped>
.video-container {
	position: relative;
	width: 100%;
	height: 90%;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: white;
}

#remoteVideo {
	width: 100%;
	height: 100%;
}

#localVideo {
	position: absolute;
	width: 20%;
	height: auto;
	bottom: 10px;
	right: 10px;
	border: 2px solid #ccc;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
	background-color: white;
}

.button-container {
	position: absolute;
	bottom: 10px;
	left: 50%;
	transform: translateX(-50%);
}

#startButton {
	margin-right: 10px;
}
</style>