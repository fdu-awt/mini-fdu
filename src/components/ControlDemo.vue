<script>
import {Game} from "@/three/game";
import {Lab1FbxSelfImageLoader} from "@/three/SelfImageLoader";
// import {Town} from "@/three/GameEnvironment";
import {GuangHuaLou} from "@/three/GameEnvironment";
import SettingDialog from "@/components/SettingDialog.vue";

export default {
	name: "ControlDemo",
	components: {SettingDialog},
	data() {
		return {
			game: null,
			showSettingDialog: false,
		};
	},
	mounted() {
		const container = document.getElementById('canvas-container');
		this.game = new Game(container, new GuangHuaLou() , new Lab1FbxSelfImageLoader());
		this.listenKeyDown();
	},
	methods: {
		listenKeyDown(){
			document.addEventListener('keydown', (e) => {
				if (e.key === 'z') {
					this.showSettingDialog = !this.showSettingDialog;
				}
			});
		},
		onSettingDialogClose(){
			console.log('onSettingDialogClose');
			this.showSettingDialog = false;
		},
	},
};
</script>

<template>
	<div id="canvas-container"></div>
	<SettingDialog :show="showSettingDialog" @close="onSettingDialogClose"/>
</template>

<style scoped>
#canvas-container {
	width: 100%;
	height: 100%;
}
</style>