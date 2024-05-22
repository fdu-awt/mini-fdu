<template>
  <div id="canvas-container">
    <!-- Your game canvas will be here -->
    <ChatBox
        v-if="isChatBoxVisible"
        :localId="localId"
        :remoteId="remoteId"
        :socket="socket"
        @close="closeChatBox"
    />
  </div>
</template>

<script>
import { Game } from "@/three/game";
import { Lab1FbxSelfImageLoader } from "@/three/SelfImageLoader";
import { GuangHuaLou } from "@/three/GameEnvironment";
import ChatBox from "@/components/ChatBox.vue"; // 导入子组件

export default {
	name: "ControlDemo",
	components: {
		ChatBox  // 注册子组件
	},
	data() {
		return {
			game: null,
			isChatBoxVisible: false, // 用于控制ChatBox的显示
			localId: null,
			remoteId: null,
			socket: null
		};
	},
	mounted() {
		const container = document.getElementById('canvas-container');
		this.game = new Game(container, new GuangHuaLou(), new Lab1FbxSelfImageLoader());

		// 假设Game有一个方法可以添加点击事件监听
		window.addEventListener('objectClicked', (event) => {
			this.handleObjectClick(event.detail.localId, event.detail.remoteId, event.detail.socket);
		});
	},
	methods: {
		handleObjectClick(localId, remoteId, socket) {
			this.localId = localId;
			this.remoteId = remoteId;
			this.socket = socket;
			this.isChatBoxVisible = true; // 点击对象时显示ChatBox
		},
		closeChatBox() {
			this.isChatBoxVisible = false; // 关闭ChatBox的方法
		}
	}
};
</script>
