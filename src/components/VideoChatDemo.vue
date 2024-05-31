<script>
import videoChatService from "@/api/socket/VideoChatService";
import store from "@/store";
import videoChatEventEmitter, {VIDEO_CHAT_EVENTS} from "@/event/VideoChatEventEmitter";
import {ElMessageBox} from "element-plus";
import gameEventEmitter from "@/event/GameEventEmitter";

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
			videoChatService.userId = userId;
			startButton.addEventListener('click', () => {
				videoChatEventEmitter.emit(VIDEO_CHAT_EVENTS.START, toId);
			});
			hangupButton.addEventListener('click', () => {
				videoChatService.hangup();
			});
			videoChatEventEmitter.on(VIDEO_CHAT_EVENTS.START, this.onChatStart.bind(this));
			videoChatEventEmitter.on(VIDEO_CHAT_EVENTS.INVITE, this.onChatInvite.bind(this));
			videoChatEventEmitter.on(VIDEO_CHAT_EVENTS.END, () => {
				ElMessageBox.alert('对方已挂断', '视频聊天结束', {
					confirmButtonText: '确定',
					type: 'warning',
				}).then(() => {
					this.visible = false;
				}).catch(() => {
					this.visible = false;
				});
			});
			videoChatEventEmitter.on(VIDEO_CHAT_EVENTS.REJECTED, (msg) => {
				ElMessageBox.alert(msg, '视频聊天被拒绝', {
					confirmButtonText: '确定',
					type: 'warning',
				}).then(() => {
					this.visible = false;
				}).catch(() => {
					this.visible = false;
				});
			});
		},
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
		onChatInvite(fromId){
			const onAccept = () => {
				this.visible = true;
				this.$nextTick(() => {
					const localVideo = document.getElementById('localVideo');
					const remoteVideo = document.getElementById('remoteVideo');
					videoChatService.accept(fromId, localVideo, remoteVideo);
				});
			};
			const onReject = () => {
				videoChatService.reject(fromId);
			};
			// TODO 加入用户名的显示
			ElMessageBox.confirm('收到视频聊天邀请，是否接受？', '视频聊天邀请', {
				confirmButtonText: '接受',
				cancelButtonText: '拒绝',
				type: 'warning',
			}).then(onAccept).catch(onReject);
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
	width: 100vw;
	height: 90vh;
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