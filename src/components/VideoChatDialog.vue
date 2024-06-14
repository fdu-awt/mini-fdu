<script>
import videoChatService from "@/api/socket/VideoChatService";
import videoChatEventEmitter, { VIDEO_CHAT_EVENTS } from "@/event/VideoChatEventEmitter";
import gameEventEmitter from "@/event/GameEventEmitter";
import { ElMessageBox } from "element-plus";

export default {
	name: "VideoChatDialog",
	data() {
		return {
			userId: null,
			visible: false,
			isRemoteLoading: false, // 添加此属性以表示加载状态
			boundChatAccepted: null,
			boundChatStart: null,
			boundChatInvite: null,
			boundChatEnd: null,
			boundChatRejected: null,
		};
	},
	mounted() {
		this.boundChatAccepted = this.onChatAccepted.bind(this);
		videoChatEventEmitter.on(VIDEO_CHAT_EVENTS.ACCEPTED, this.boundChatAccepted);
		this.boundChatStart = this.onChatStart.bind(this);
		videoChatEventEmitter.on(VIDEO_CHAT_EVENTS.START, this.boundChatStart);
		this.boundChatInvite = this.onChatInvite.bind(this);
		videoChatEventEmitter.on(VIDEO_CHAT_EVENTS.INVITE, this.boundChatInvite);
		this.boundChatEnd = this.onChatEnd.bind(this);
		videoChatEventEmitter.on(VIDEO_CHAT_EVENTS.END, this.boundChatEnd);
		this.boundChatRejected = this.onChatRejected.bind(this);
		videoChatEventEmitter.on(VIDEO_CHAT_EVENTS.REJECTED, this.boundChatRejected);
	},
	beforeUnmount() {
		videoChatEventEmitter.off(VIDEO_CHAT_EVENTS.ACCEPTED, this.boundChatAccepted);
		videoChatEventEmitter.off(VIDEO_CHAT_EVENTS.START, this.boundChatStart);
		videoChatEventEmitter.off(VIDEO_CHAT_EVENTS.INVITE, this.boundChatInvite);
		videoChatEventEmitter.off(VIDEO_CHAT_EVENTS.END, this.boundChatEnd);
		videoChatEventEmitter.off(VIDEO_CHAT_EVENTS.REJECTED, this.boundChatRejected);
	},
	methods: {
		onChatAccepted() {
			// 处理对方接受邀请的逻辑，例如隐藏加载覆盖层等
			console.log('对方已接受视频聊天邀请');
			this.isRemoteLoading = false; // 隐藏加载覆盖层
		},
		onChatStart(toId) {
			gameEventEmitter.requestAllControl();
			this.visible = true;
			this.isRemoteLoading = true;
			this.$nextTick(() => {
				const localVideo = document.getElementById('localVideo');
				const remoteVideo = document.getElementById('remoteVideo');
				console.log("remoteVideo",remoteVideo);
				videoChatService.invite(toId, localVideo, remoteVideo)
					.then(() => {
						console.log(toId);
						console.log("已发出邀请");
					})
					.catch((err) => {
						console.error(err.name + ': ' + err.message);
						this.isRemoteLoading = false; // 出错时隐藏加载覆盖层
					});
			});
		},
		onChatInvite(fromId) {
			const onAccept = () => {
				this.visible = true;
				this.isRemoteLoading = true;
				this.$nextTick(() => {
					const localVideo = document.getElementById('localVideo');
					const remoteVideo = document.getElementById('remoteVideo');
					videoChatService.accept(fromId, localVideo, remoteVideo)
						.then(() => {
							this.isRemoteLoading = false; // 接受邀请后隐藏加载覆盖层
						})
						.catch((err) => {
							console.error(err.name + ': ' + err.message);
							this.isRemoteLoading = false; // 出错时隐藏加载覆盖层
						});
				});
			};
			const onReject = () => {
				videoChatService.reject(fromId);
			};
			ElMessageBox.confirm('收到视频聊天邀请，是否接受？', '视频聊天邀请', {
				confirmButtonText: '接受',
				cancelButtonText: '拒绝',
				type: 'warning',
			}).then(onAccept).catch(onReject);
		},
		onChatEnd() {
			ElMessageBox.alert('对方已挂断', '视频聊天结束', {
				confirmButtonText: '确定',
				type: 'warning',
			}).then(() => {
				this.visible = false;
			}).catch(() => {
				this.visible = false;
			});
		},
		onHangUp() {
			videoChatService.hangup().then(() => {
				this.visible = false;
			});
		},
		onChatRejected(msg) {
			ElMessageBox.alert(msg, '视频聊天被拒绝', {
				confirmButtonText: '确定',
				type: 'warning',
			}).then(() => {
				this.visible = false;
			}).catch(() => {
				this.visible = false;
			});
		}
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
      <div v-if="isRemoteLoading" class="loading-overlay">正在呼叫...</div>
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

.loading-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 255, 255, 0.8);
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  font-size: 18px;
  color: #333;
}
</style>
