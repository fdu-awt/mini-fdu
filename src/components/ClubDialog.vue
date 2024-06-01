<script>
import {
	ElDialog,
	ElImage,
	ElText
} from 'element-plus';
import {getAllClubData} from "@/api/study.js";
import ButtonHover1 from './common/ButtonHover1.vue';
import gameEventEmitter from "@/event/GameEventEmitter";

export default {
	name: "ClubDialog",
	components: {
		ElDialog,
		ElImage,
		ElText,
		ButtonHover1,
	},
	data() {
		return {
			clubDialogVisible: false,
			clubId: -1,
			club_data: null,
			current_club_data: null,
		};
	},
	mounted(){
		this.getAllClubData().then(()=>{
			window.addEventListener('ClickClub', this.handleStorageChange);
		}).catch(e => {
			console.error(e);
		});
	},
	beforeUnmount() {
		window.removeEventListener('ClickClub', this.handleStorageChange);
	},
	methods: {
		handleStorageChange(event) {
			gameEventEmitter.requestAllControl();
			this.clubDialogVisible = true;
			this.clubId = event.key;
			this.current_club_data = this.club_data[this.clubId];
		},
		getAllClubData() {
			return new Promise((resolve, reject) => {
				getAllClubData().then((res) => {
					if (res.code === 200) {
						this.club_data = res.object;
						resolve(res.object);
					} else {
						reject(new Error(`Unexpected response code: ${res.code}`));
					}
				}).catch((e) => {
					reject(e);
				});
			});
		},
		handleAskForAI(){
			this.$emit("askAI");
			this.clubDialogVisible = false;
		}
	}
};
</script>

<template>
    <el-dialog v-model="clubDialogVisible" width="900" v-modal="true" v-close-on-click-modal="false" center="true">
        <div id="dialog-container">
			<el-image style="width: 300px; height: 200px" :src="'./club/images/' + current_club_data.profile" :fit="contain" />
			<h3>{{ current_club_data.name }}</h3>
      <h4>{{ current_club_data.slogan }}</h4>
			<el-text size="default" class="intro">{{ current_club_data.intro }}</el-text>
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

h4{
  display:block;
  padding-bottom: 20px
}

.el-dialog, .el-dialog--center,.el-overlay-dialog {
	border-radius: 50px;
}
</style>
