<script>
import {
	ElDialog,
	ElImage,
	ElText
} from 'element-plus';
import {getAllHistoryData} from "@/api/study.js";
import ButtonHover1 from './common/ButtonHover1.vue';
import gameEventEmitter from "@/event/GameEventEmitter";

export default {
	name: "PostDialog",
	components: {
		ElDialog,
		ElImage,
		ElText,
		ButtonHover1,
	},
	data() {
		return {
			postDialogVisible: false,
			postId: -1,
			history_data: null,
			current_history_data: null,
		};
	},
	mounted(){
		this.getAllHistoryData().then(()=>{
			window.addEventListener('ClickPost', this.handleStorageChange);
		}).catch(e => {
			console.error(e);
		});
	},
	beforeUnmount() {
		window.removeEventListener('ClickPost', this.handleStorageChange);
	},
	methods: {
		handleStorageChange(event) {
			gameEventEmitter.requestAllControl();
			this.postDialogVisible = true;
			this.postId = event.key;
			this.current_history_data = this.history_data[this.postId];
		},
		getAllHistoryData(){
			return new Promise((resolve, reject) => {
				getAllHistoryData().then((res)=>{
					if(res.code===200){
						this.history_data = res.object;
						resolve(res.object);
					} else {
						reject(new Error(`Unexpected response code: ${res.code}`));
					}
				}).catch(e => {
					reject(e);
				});
			});
		},
		handleAskForAI(){
			this.$emit("askAI");
			this.postDialogVisible = false;
		}
	}
};
</script>

<template>
    <el-dialog v-model="postDialogVisible" width="900" v-modal="true" v-close-on-click-modal="false" center="true">
        <div id="dialog-container">
			<el-image style="width: 300px; height: 200px" :src="'./history/images/' + current_history_data.image" :fit="contain" />
			<h3>{{ current_history_data.title }}</h3>
			<el-text size="default">{{ current_history_data.intro }}</el-text>
			<br/>
			<ButtonHover1 msg="点击询问AI" @click="handleAskForAI"/>
		</div>
    </el-dialog>
</template>

<style scoped>
#dialog-container{
	height: 500px;
	width: 800px;

	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
	margin:auto;
}

h3{
	display:block;
	padding: 25px
}

.el-dialog, .el-dialog--center,.el-overlay-dialog {
	border-radius: 50px;
}
</style>
