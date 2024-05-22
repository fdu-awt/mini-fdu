<script>
import PersonalInfo from "@/components/PersonalInfo.vue";
import StudyRecord from "@/components/StudyRecord.vue";
export default {
	name: "SettingDialog",
	props: {
		show: {
			type: Boolean,
			default: false,
			required: true,
		}
	},
	components: {
		PersonalInfo,
		StudyRecord,
	},
	data() {
		return {
			isVisible: this.show,
			activeMenu: '1',
		};
	},
	methods: {
		handleSelect(key) {
			this.activeMenu = key;
		},
		handleClose() {
			this.$emit('close', false);
		}
	},
	watch: {
		show(newVal) {
			this.isVisible = newVal;
		}
	},
};
</script>

<template>
	<el-dialog v-model="isVisible" @close="handleClose">
		<div class="container">
			<div class="center-container">
				<el-row span="24">
					<el-col :span="4">
						<el-menu
								default-active="1"
								class="el-menu-vertical-demo"
								@select="handleSelect">
							<el-menu-item index="1">
								<span>个人信息</span>
							</el-menu-item>
							<el-menu-item index="2">
								<span>学习记录</span>
							</el-menu-item>
						</el-menu>
					</el-col>
					<el-col :span="20">
						<div v-if="activeMenu === '1'">
							<PersonalInfo/>
						</div>
						<div v-if="activeMenu === '2'">
							<StudyRecord/>
						</div>
					</el-col>
				</el-row>
			</div>
		</div>
	</el-dialog>
</template>

<style scoped>
.container {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}
.center-container {
	width: 80%;
	height: 70%;
}
</style>