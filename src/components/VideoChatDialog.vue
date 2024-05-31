<script>
import VideoChatService from "@/api/socket/VideoChatService";
import videoChatEventEmitter, { VIDEO_CHAT_EVENTS } from "@/event/VideoChatEventEmitter";
import store from "@/store";

export default {
	name: "VideoChatDialog",
	data() {
		return {
			userId: null,
			toId: null,
			visible: false,
			videoChatService: null,
		};
	},
	mounted() {
		const localVideo = document.getElementById('localVideo');
		const remoteVideo = document.getElementById('remoteVideo');
		const signalingServerUrl = process.env.VUE_APP_VIDEO_CHAT_WEBSOCKET_BASE_URL;
		// TODO 如果本机演示，需要使用不同的 userId
		this.userId = store.getUserId();
		this.toId = this.userId + 1;
		store.setUserId(this.toId);
		this.videoChatService = new VideoChatService(localVideo, remoteVideo, signalingServerUrl, this.userId);
		videoChatEventEmitter.on(VIDEO_CHAT_EVENTS.START, this.onChatStart.bind(this));
	},
	methods: {
		onChatStart() {
			this.visible = true;
			this.videoChatService.invite(this.toId);
		},
		onHangUp() {
			this.videoChatService.hangup().then(() => {
				this.visible = false;
			});
		},
	},
};
</script>

<template>
	<el-dialog
			v-model="visible"
			width="1000"
			align-center
			:show-close="false"
			:close-on-click-modal="false"
			:close-on-press-escape="false">
		<div class="video-container">
			<video id="remoteVideo" autoplay playsinline/>
			<video id="localVideo" autoplay playsinline/>
			<el-button id="hangupButton" type="danger" @click="onHangUp">挂断</el-button>
		</div>
	</el-dialog>
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