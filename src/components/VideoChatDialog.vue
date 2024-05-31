<script>
import videoChatService from "@/api/socket/VideoChatService";
import videoChatEventEmitter, { VIDEO_CHAT_EVENTS } from "@/event/VideoChatEventEmitter";
import gameEventEmitter from "@/event/GameEventEmitter";

export default {
	name: "VideoChatDialog",
	data() {
		return {
			userId: null,
			visible: false,
		};
	},
	mounted() {
		videoChatEventEmitter.on(VIDEO_CHAT_EVENTS.START, this.onChatStart.bind(this));
	},
	methods: {
		onChatStart(toId) {
			gameEventEmitter.requestAllControl();
			this.visible = true;
			this.$nextTick(() => {
				const localVideo = document.getElementById('localVideo');
				console.log("localVideo", localVideo);
				const remoteVideo = document.getElementById('remoteVideo');
				videoChatService.invite(toId, localVideo, remoteVideo);
			});
		},
		onHangUp() {
			videoChatService.hangup().then(() => {
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