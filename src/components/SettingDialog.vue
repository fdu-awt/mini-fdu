<script>
import {ElDialog, ElButton, ElRow, ElCol, ElMenu, ElSubMenu, ElIcon, ElMenuItem, ElMenuItemGroup} from 'element-plus';
import {
	Document,
	Menu as IconMenu,
	Location,
	Refresh,
	DataLine
} from '@element-plus/icons-vue';

import PersonalInfo from "@/components/PersonalInfo.vue";
import QuizRecord from '@/components/QuizRecord.vue';
import QuizReview from '@/components/QuizReview.vue';
import QuizAnalysis from '@/components/QuizAnalysis.vue';

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
		QuizRecord,
		QuizReview,
		QuizAnalysis,
		ElDialog,
		ElButton,
		ElRow,
		ElCol,
		ElMenu,
		ElSubMenu,
		ElIcon,
		ElMenuItem,
		ElMenuItemGroup,
		Location,
		Refresh,
		DataLine,
		Document,
		IconMenu
	},
	data() {
		return {
			isVisible: this.show,
			currentPage: 'PersonalInfo',
		};
	},
	methods: {
		navigate(page) {
			// 根据点击的导航项切换当前页面组件
			this.currentPage = page;
		},
		handleClose() {
			this.$emit('close', false);
		},
	},
	watch: {
		show(newVal) {
			this.isVisible = newVal;
		}
	},
};
</script>
<template>
  <div>
    <el-dialog v-model="isVisible" title="后台管理" width="1000" height="800">
      <el-row class="tac">
        <el-col :span="4">
          <el-menu default-active="2" class="el-menu-vertical-demo" @close="handleClose">
            <el-menu-item index="1" @click="navigate('PersonalInfo')">
              <el-icon>
                <icon-menu/>
              </el-icon>
              <span>个人信息</span>
            </el-menu-item>
            <el-menu-item index="2" @click="navigate('QuizRecord')">
              <el-icon>
                <document/>
              </el-icon>
              <span>答题记录</span>
            </el-menu-item>
            <el-menu-item index="3" @click="navigate('QuizReview')">
              <el-icon>
                <Refresh/>
              </el-icon>
              <span>错题复盘</span>
            </el-menu-item>
            <el-menu-item index="4" @click="navigate('QuizAnalysis')">
              <el-icon>
                <DataLine/>
              </el-icon>
              <span>学习分析</span>
            </el-menu-item>
          </el-menu>
        </el-col>
        <el-col :span="20">
          <component :is="currentPage"></component>
        </el-col>
      </el-row>
    </el-dialog>
  </div>
</template>

<style scoped>
.el-dialog {
  max-height: 1200px;
  overflow-y: scroll;
}

.el-col {
  height: 600px;
  overflow: auto;
}

.tac {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.el-menu-item {
  padding: 40px;
}
</style>