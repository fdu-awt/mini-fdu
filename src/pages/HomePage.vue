<!--<script>-->
<!--// import ControlDemo from "@/components/ControlDemo.vue";-->
<!--import ChatBox from "@/components/ChatBox.vue";-->
<!--export default {-->
<!--	name: "HomePage",-->
<!--	components: {ChatBox},-->
<!--	data() {-->
<!--		return {-->
<!--			currentLocalId: 1, // 示例用户ID-->
<!--			currentRemoteId: 2, // 示例对方用户ID-->
<!--			socket: null-->
<!--		};-->
<!--	},-->
<!--	created() {-->
<!--		this.socket = new WebSocket(`ws://localhost:8798/chat/${this.currentLocalId}`);-->
<!--		console.log(this.socket);-->
<!--		this.socket.onopen = () => {-->
<!--			console.log("WebSocket connection established");-->
<!--		};-->
<!--		this.socket.onclose = () => {-->
<!--			console.log("WebSocket connection closed");-->
<!--		};-->
<!--		this.socket.onerror = (error) => {-->
<!--			console.error("WebSocket error:", error);-->
<!--		};-->
<!--	}-->
<!--};-->
<!--</script>-->

<!--<template>-->
<!--  <ChatBox-->
<!--      :local-id="currentLocalId"-->
<!--      :remote-id="currentRemoteId"-->
<!--      :socket="socket"-->
<!--  />-->
<!--</template>-->

<!--<style scoped>-->
<!--</style>-->

<script>
import ControlDemo from "@/components/ControlDemo.vue";

export default {
	name: "HomePage",
	components: {ControlDemo}
};
</script>

<template>
  <!--	<div>首页：公共光草</div>-->
  <ControlDemo/>
</template>

<style scoped>

</style>
