<script>
import {Game} from "@/three/game";
import {Lab1FbxSelfImageLoader} from "@/three/SelfImageLoader";
import {GuangHuaLou} from "@/three/GameEnvironment";
import PostDialog from "@/components/PostDialog.vue";

export default {
	name: "ControlDemo",
	components: {
		PostDialog,
	},
	data() {
		return {
			game: null,
		};
	},
	mounted() {
		const container = document.getElementById('canvas-container');
		this.game = new Game(container, new GuangHuaLou() , new Lab1FbxSelfImageLoader());
	},
};
</script>

<template>
	<div id="canvas-container"></div>

	<PostDialog/>	
</template>

<style scoped>
#canvas-container {
	width: 100%;
	height: 100%;
}
</style>