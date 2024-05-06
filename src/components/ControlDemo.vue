<script>
import {Game} from "@/three/game";

export default {
	name: "ControlDemo",
	data() {
		return {
			game: null
		};
	},
	mounted() {
		const container = document.getElementById('canvas-container');
		this.game = new Game(container);
	},
};
</script>

<template>
	<div id="canvas-container"></div>
</template>

<style scoped>
#canvas-container {
	width: 100%;
	height: 100%;
}
</style>