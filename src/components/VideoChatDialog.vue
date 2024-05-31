<script>
import videoChatService from "@/api/socket/VideoChatService";
import videoChatEventEmitter, { VIDEO_CHAT_EVENTS } from "@/event/VideoChatEventEmitter";
import gameEventEmitter from "@/event/GameEventEmitter";
import {ElMessageBox} from "element-plus";

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
		videoChatEventEmitter.on(VIDEO_CHAT_EVENTS.SELF_END, () => {
			this.visible = false;
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

#hangupButton {
	position: absolute;
	bottom: 10px;
	left: 50%;
	transform: translateX(-50%);
}
</style>