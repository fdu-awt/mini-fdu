<script>
import {Game} from "@/three/game";
import {Lab1FbxSelfImageLoader} from "@/three/SelfImageLoader";
import {GuangHuaLou} from "@/three/GameEnvironment";
import SettingDialog from "@/components/SettingDialog.vue";
import ChatBox from "@/components/ChatBox.vue";
import gameEventEmitter, {GAME_EVENTS}  from "@/event/GameEventEmitter";
import PostDialog from "@/components/PostDialog.vue";
import ClubDialog from "@/components/ClubDialog.vue";

export default {
	name: "ControlDemo",
	components: {
		PostDialog,
		ClubDialog,
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
		};
	},
	mounted() {
		this.canvasContainer = document.getElementById('canvas-container');
		this.game = new Game(this.canvasContainer, new GuangHuaLou() , new Lab1FbxSelfImageLoader());
		this.listenKeyDown();
		// 假设Game有一个方法可以添加点击事件监听
		window.addEventListener('objectClicked', (event) => {
			this.handleObjectClick(event.detail.localId, event.detail.remoteId, event.detail.socket);
		});
	},
	methods: {
		listenKeyDown(){
			// 按下 Z 键时显示后台设置页面
			gameEventEmitter.on(GAME_EVENTS.KEY_DOWN_Z, () => {
				this.showSettingDialog = !this.showSettingDialog;
				// 申请解除鼠标锁定
				gameEventEmitter.emit(GAME_EVENTS.REQUEST_MOUSE_CONTROL);
				// 申请接触键盘锁定
				gameEventEmitter.emit(GAME_EVENTS.REQUEST_KEYBOARD_CONTROL);
			});
		},
		onSettingDialogClose(){
			console.log('onSettingDialogClose');
			this.showSettingDialog = false;
		},
		handleObjectClick(localId, remoteId, socket) {
			this.localId = localId;
			this.remoteId = remoteId;
			this.socket = socket;
			this.isChatBoxVisible = true; // 点击对象时显示ChatBox
		},
		closeChatBox() {
			this.isChatBoxVisible = false; // 关闭ChatBox的方法
		}
	},
};
</script>

<template>
	<div id="canvas-container"></div>

	<PostDialog/>	
	<ClubDialog/>
	
	<SettingDialog :show="showSettingDialog" @close="onSettingDialogClose"/>
	<ChatBox v-if="isChatBoxVisible" :socket="socket" :remote-id="remoteId" :local-id="localId" @close="closeChatBox" />
</template>

<style scoped>
#canvas-container {
  width: 100%;
  height: 100%;
}
</style>