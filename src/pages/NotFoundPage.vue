<script>
import LoadingBoxPacking from "@/components/common/LoadingBoxPacking.vue";
import ButtonHover1 from "@/components/common/ButtonHover1.vue";

export default {
	name: "NotFoundPage",
	components: {
		LoadingBoxPacking, ButtonHover1
	},
	data() {
		return {
			msg: "返 回 首 页"
		};
	},
	methods: {
		onClick() {
			this.$router.push("/");
		}
	}
};
</script>

<template>
	<div id="not-found-page-container">
		<div class="item" id="first">
			<h1>页面不存在</h1>
		</div>
		<div class="item" id="first">
			<ButtonHover1 :onClick="onClick" :msg="msg"/>
		</div>
		<div class="item">
			<LoadingBoxPacking class="loading-box-packing"/>
		</div>
	</div>
</template>

<style>
#not-found-page-container {
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

#first {
	margin-top: -100px;
	margin-bottom: 100px;
}

h1 {
	font-size: 100px;
	color: rgba(0, 0, 0, 0.6);
}

a {
	font-size: .7em;
	font-weight: 500;
	color: #2e2e2e;
	text-decoration: none;
	padding: 8px 15px;
	border-radius: 20px;
}
</style>