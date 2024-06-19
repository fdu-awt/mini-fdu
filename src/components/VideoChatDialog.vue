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
			isRemoteLoading: false,
			boundChatAccepted: null,
			boundChatStart: null,
			boundChatInvite: null,
			boundChatEnd: null,
			boundChatRejected: null,
			inviteDialogVisible: false,
			inviteFromId: null,
			// invitationCancelled: false, // 添加这个状态
			isSelfEnded: false, // 新增状态，用来标记是否是自己挂断的聊天
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
			this.isSelfEnded = true; // 设置标志，表示挂断是由用户自己发起的
			videoChatService.hangup(!this.isRemoteLoading).then(() => {
				this.closeVideoChat();
			});
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
		// 前端接收到对方已经挂断的消息时调用此方法
		onChatSelfEnd() {
			this.closeInviteDialog();
			// 如果是对方挂断的，显示提示对话框
			if(!this.isSelfEnded) {
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
						this.isRemoteLoading = false; // 接受邀请后隐藏加载覆盖层
					})
					.catch((err) => {
						console.error(err.name + ': ' + err.message);
						this.isRemoteLoading = false; // 出错时隐藏加载覆盖层
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
			this.isSelfEnded = false; // 标记不是自己挂断的
			this.closeInviteDialog();
			ElMessageBox.alert('对方已挂断', '视频聊天结束', {
				confirmButtonText: '确定',
				type: 'warning',
			}).then(() => {
				this.closeVideoChat();
			}).catch(() => {
				this.closeVideoChat();
			});
		},

		onChatRejected(msg) {
			this.closeInviteDialog();
			ElMessageBox.alert(msg, '视频聊天被拒绝', {
				confirmButtonText: '确定',
				type: 'warning',
			}).then(() => {
				this.closeVideoChat();
			}).catch(() => {
				this.closeVideoChat();
			});
		},
		closeInviteDialog() {
			this.inviteDialogVisible = false;
		},
		// 关闭视频聊天界面的通用方法
		closeVideoChat() {
			this.visible = false; // 关闭视频聊天界面
			this.isRemoteLoading = false; // 重置加载状态
			this.inviteDialogVisible = false; // 关闭邀请对话框
			// 这里可以添加其他需要重置的状态或资源清理工作
			const localVideo = document.getElementById('localVideo');
			const remoteVideo = document.getElementById('remoteVideo');
			if (localVideo) {
				localVideo.srcObject = null;
			}
			if (remoteVideo) {
				remoteVideo.srcObject = null;
			}
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
      <div v-if="isRemoteLoading" class="loading-overlay">正在呼叫...</div>
      <video id="remoteVideo" autoplay playsinline/>
      <video id="localVideo" autoplay playsinline/>
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

.invite-footer {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 20px;
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
