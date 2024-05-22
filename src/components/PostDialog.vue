<script>
import {
	ElDialog,
	ElImage,
	ElText
} from 'element-plus';
import {getAllHistoryData} from "@/api/study.js";

export default {
	name: "PostDialog",
	components: {
		ElDialog,
		ElImage,
		ElText,
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
		window.addEventListener('ClickPost', this.handleStorageChange);

		this.history_data = getAllHistoryData().then((res)=>{
			if(res.code==200){
				this.history_data = res.object;
			}

			// console.log("data", this.history_data);
		}).catch(e => {
			console.error(e);
		});
	},
	beforeUnmount() {
		window.removeEventListener('ClickPost', this.handleStorageChange);
	},
	methods: {
		handleStorageChange(event) {
			this.postDialogVisible = true;
			this.postId = event.key;
			this.current_history_data = this.history_data[this.postId];
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
		</div>
    </el-dialog>
</template>

<style scoped>
#dialog-container{
	height: 65vh;
	width: 65vw;

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
