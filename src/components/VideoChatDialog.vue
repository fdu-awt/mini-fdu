<script>
import videoChatService from "@/api/socket/VideoChatService";
import videoChatEventEmitter, {VIDEO_CHAT_EVENTS} from "@/event/VideoChatEventEmitter";
import gameEventEmitter from "@/event/GameEventEmitter";
import {ElMessageBox} from "element-plus";
import LoadingVideo from "@/components/common/LoadingVideo.vue"; // Import the new component

export default {
	name: "VideoChatDialog",
	components: {
		LoadingVideo
	},
	data() {
		return {
			userId: null,
			visible: false,
			isRemoteLoading: false,
			boundChatAccepted: null,
			boundChatStart: null,
			boundChatInvite: null,
			boundChatEnd: null,
			boundChatRejected: null,
			inviteDialogVisible: false,
			inviteFromId: null,
			isSelfEnded: false,
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
		this.boundChatSelfEnd = this.onChatSelfEnd.bind(this);
		videoChatEventEmitter.on(VIDEO_CHAT_EVENTS.SELF_END, this.boundChatSelfEnd);
	},
	beforeUnmount() {
		videoChatEventEmitter.off(VIDEO_CHAT_EVENTS.ACCEPTED, this.boundChatAccepted);
		videoChatEventEmitter.off(VIDEO_CHAT_EVENTS.START, this.boundChatStart);
		videoChatEventEmitter.off(VIDEO_CHAT_EVENTS.INVITE, this.boundChatInvite);
		videoChatEventEmitter.off(VIDEO_CHAT_EVENTS.END, this.boundChatEnd);
		videoChatEventEmitter.off(VIDEO_CHAT_EVENTS.REJECTED, this.boundChatRejected);
		videoChatEventEmitter.off(VIDEO_CHAT_EVENTS.SELF_END, this.boundChatSelfEnd);
	},
	methods: {
		onChatAccepted() {
			console.log('对方已接受视频聊天邀请');
			this.isRemoteLoading = false;
		},
		onHangUp() {
			this.isSelfEnded = true;
			videoChatService.hangup(!this.isRemoteLoading).then(() => {
				this.visible = false;
			});
		},
		onChatStart(toId) {
			gameEventEmitter.requestAllControl();
			this.visible = true;
			this.isRemoteLoading = true;
			this.$nextTick(() => {
				const localVideo = document.getElementById('localVideo');
				const remoteVideo = document.getElementById('remoteVideo');
				console.log("remoteVideo", remoteVideo);
				videoChatService.invite(toId, localVideo, remoteVideo)
					.then(() => {
						console.log(toId);
						console.log("已发出邀请");
					})
					.catch((err) => {
						console.error(err.name + ': ' + err.message);
						this.isRemoteLoading = false;
					});
			});
		},
		onChatSelfEnd() {
			this.closeInviteDialog();
			if (!this.isSelfEnded) {
				ElMessageBox.alert('对方已挂断', '视频聊天结束', {
					confirmButtonText: '确定',
					type: 'warning',
				}).then(() => {
					this.closeVideoChat();
				}).catch(() => {
					this.closeVideoChat();
				});
			}
		},
		acceptInvite() {
			this.visible = true;
			this.isRemoteLoading = true;
			this.inviteDialogVisible = false;
			this.$nextTick(() => {
				const localVideo = document.getElementById('localVideo');
				const remoteVideo = document.getElementById('remoteVideo');
				videoChatService.accept(this.inviteFromId, localVideo, remoteVideo)
					.then(() => {
						this.isRemoteLoading = false;
					})
					.catch((err) => {
						console.error(err.name + ': ' + err.message);
						this.isRemoteLoading = false;
					});
			});
		},
		rejectInvite() {
			videoChatService.reject(this.inviteFromId);
			this.inviteDialogVisible = false;
		},
		onChatInvite(fromId) {
			this.inviteFromId = fromId;
			this.inviteDialogVisible = true;
		},
		onChatEnd() {
			this.isSelfEnded = false;
			this.closeInviteDialog();
			ElMessageBox.alert('对方已挂断', '视频聊天结束', {
				confirmButtonText: '确定',
				type: 'warning',
			}).then(() => {
				this.visible = false;
			}).catch(() => {
				this.visible = false;
			});
		},
		onChatRejected(msg) {
			this.closeInviteDialog();
			ElMessageBox.alert(msg, '视频聊天被拒绝', {
				confirmButtonText: '确定',
				type: 'warning',
			}).then(() => {
				this.visible = false;
			}).catch(() => {
				this.visible = false;
			});
		},
		closeInviteDialog() {
			this.inviteDialogVisible = false;
		},
		closeVideoChat() {
			this.visible = false;
			this.isRemoteLoading = false;
			this.inviteDialogVisible = false;
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
      <div class="video-overlay" v-if="isRemoteLoading">
        <loading-video /> <!-- Use the new component -->
      </div>
      <video id="remoteVideo" autoplay playsinline />
      <video id="localVideo" autoplay playsinline />
      <el-button id="hangupButton" type="danger" @click="onHangUp">挂断</el-button>
    </div>
  </el-dialog>
  <el-dialog
      v-model="inviteDialogVisible"
      title="视频聊天邀请"
      width="30%"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false">
    <span>收到视频聊天邀请，是否接受？</span>
    <div class="invite-footer">
      <el-button @click="rejectInvite">拒绝</el-button>
      <el-button type="primary" @click="acceptInvite">接受</el-button>
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

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  z-index: 10; /* Ensure it appears above the videos */
}

.invite-footer {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20px;
}

#remoteVideo {
  width: 100%;
  height: 100%;
  z-index: 1; /* Ensure the video is below the overlay */
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
  z-index: 15; /* Ensure the local video is above the overlay */
}

#hangupButton {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 15; /* Ensure the button is above the overlay */
}
</style>



