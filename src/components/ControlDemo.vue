<script>
import {Game} from "@/three/game";
import {Lab1FbxSelfImageLoader} from "@/three/SelfImageLoader";
import {GuangHuaLou} from "@/three/GameEnvironment";
import SettingDialog from "@/components/SettingDialog.vue";
import ChatBox from "@/components/ChatBox.vue";
import gameEventEmitter, {GAME_EVENTS}  from "@/event/GameEventEmitter";
import PostDialog from "@/components/PostDialog.vue";
import ClubDialog from "@/components/ClubDialog.vue";
import eventBus from '@/eventbus/eventBus.js';
import AIChatDialog from '@/components/AIChatDialog.vue';
import QuizDialog from '@/components/QuizDialog.vue';
import VideoChatDialog from "@/components/VideoChatDialog.vue";
import VideoChatService from "@/api/socket/VideoChatService";

export default {
	name: "ControlDemo",
	components: {
		VideoChatDialog,
		PostDialog,
		ClubDialog,
		AIChatDialog,
		QuizDialog,

		ChatBox,
		SettingDialog,
	},
	data() {
		return {
			game: null,
			isChatBoxVisible: false, // 用于控制ChatBox的显示
			localId: null,
			remoteId: null,
			socket: null,
			canvasContainer: null,
			showSettingDialog: false,

			AIChatDialogVisible: false,
			newMessageNotification: false, // 新消息通知的标记
		};
	},
	mounted() {
		eventBus.on('newMessage', this.handleNewMessage.bind(this));
		eventBus.on('logout', this.handleLogout.bind(this));
		this.canvasContainer = document.getElementById('canvas-container');
		this.game = new Game(this.canvasContainer, new GuangHuaLou() , new Lab1FbxSelfImageLoader());
		this.listenKeyDown();
		window.addEventListener('ClickPlayer', (event) => {
			this.openChatBox(event.detail.localId, event.detail.remoteId, event.detail.socket);
		});
	},
	beforeUnmount() {
		eventBus.off('logout', this.handleLogout); // Clean up the event listener
	},
	methods: {
		listenKeyDown(){
			// 按下 Z 键时显示后台设置页面
			gameEventEmitter.onWithDebounce(GAME_EVENTS.KEY_DOWN_Z, this.handleKeyZDown.bind(this), 300);
			// 按下 KEY_DOWN_T 时显示视频聊天demo
			gameEventEmitter.onWithDebounce(GAME_EVENTS.KEY_DOWN_T, this.handleKeyTDown.bind(this), 300);
		},
		handleKeyZDown(){
			this.showSettingDialog = !this.showSettingDialog;
			// 申请解除鼠标和键盘锁定
			gameEventEmitter.requestAllControl();
		},
		handleKeyTDown(){
			// TODO 真实的 toId
			// const toId = 1;
			// videoChatEventEmitter.emit(VIDEO_CHAT_EVENTS.START, toId);
		},
		onSettingDialogClose(){
			console.log('onSettingDialogClose');
			this.showSettingDialog = false;
		},
		handleLogout() {
			console.log(this.game);
			if (this.game) {
				this.game.player.closeWebSocket();
				VideoChatService.close();
				// this.game.gameWebSocketService.socket = null;
				console.log('WebSocket connection closed due to logout.');
			}
			// Perform any other necessary cleanup
		},
		openChatBox(localId, remoteId, socket) {
			this.localId = localId;
			this.remoteId = remoteId;
			this.socket = socket;
			// 申请解除鼠标和键盘锁定
			gameEventEmitter.requestAllControl();
			this.isChatBoxVisible = true; // 点击对象时显示ChatBox
		},
		closeChatBox() {
			console.log("正在关闭对话框");
			this.isChatBoxVisible = false; // 关闭ChatBox的方法
			this.newMessageNotification = false;
			this.localId = null; // 可选：如果需要在通知中使用localId
			this.remoteId = null; // 可选：如果需要在通知中使用remoteId
			this.socket = null; // 可选：如果需要在通知中使用socket
		},
		handleAskAI() {
			this.AIChatDialogVisible = true;
		},
		handleAIChatClose() {
			this.AIChatDialogVisible = false;
		},
		handleNewMessage({ localId, remoteId, socket }) {
			console.log("我在处理查看消息的点击");
			console.log(socket);
			// 如果ChatBox未显示，则设置新消息通知标志为true
			if (!this.isChatBoxVisible && !this.newMessageNotification) {
				this.newMessageNotification = true;
				this.localId = localId; // 可选：如果需要在通知中使用localId
				this.remoteId = remoteId; // 可选：如果需要在通知中使用remoteId
				this.socket = socket; // 可选：如果需要在通知中使用socket
			}
		},
		viewNewMessage() {
			// 用户点击查看新消息通知时调用的方法
			this.isChatBoxVisible = true;
			this.newMessageNotification = false;
			// 这里可以添加打开ChatBox后需要执行的逻辑
		},
	},
};
</script>

<template>
	<div id="canvas-container"></div>

	<PostDialog @askAI="handleAskAI"/>
	<ClubDialog @askAI="handleAskAI"/>
	<AIChatDialog :dialogVisible="this.AIChatDialogVisible" @close="handleAIChatClose"/>
	
  <QuizDialog/>
	<SettingDialog :show="showSettingDialog" @close="onSettingDialogClose"/>
	<ChatBox v-if="isChatBoxVisible" :socket="socket" :remote-id="remoteId" :local-id="localId" @close="closeChatBox" />
	<VideoChatDialog/>
  <div v-if="newMessageNotification" class="new-message-notification">
    您有一条新消息，请点击查看。
    <button @click="viewNewMessage">查看消息</button>
  </div>
</template>

<style scoped>
#canvas-container {
  width: 100%;
  height: 100%;
}
.new-message-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: #f44336; /* 红色背景 */
  color: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}

.new-message-notification button {
  margin-left: 10px;
  background-color: #ffeb3b; /* 按钮颜色 */
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}
</style>