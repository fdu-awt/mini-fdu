<script>
import {
	ElDialog,
} from 'element-plus';

export default {
	name: "PostDialog",
	components: {
		ElDialog,
	},
	data() {
		return {
			postDialogVisible: false,
			postId: -1,
		};
	},
	mounted(){
		window.addEventListener('ClickPost', this.handleStorageChange);
	},
	beforeUnmount() {
		window.removeEventListener('ClickPost', this.handleStorageChange);
	},
	methods: {
		handleStorageChange(event) {
			this.postDialogVisible = true;
			this.postId = event.key;
			console.log("ClickPost", event);
		}
	}
};
</script>

<template>
    <el-dialog v-model="postDialogVisible" width="700" v-modal="true" v-close-on-click-modal="false">
        {{ postId }}
    </el-dialog>
</template>
