<script>
import {
	ElRow, ElCol, ElTable, ElTableColumn, ElTag, ElIcon,
	ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem
} from 'element-plus';
import {ArrowDown} from '@element-plus/icons-vue';

import {analyzeQuizReview} from '@/api/quiz';

export default {
	name: 'QuizReview',
	components: {
		ElRow,
		ElCol,
		ElTable,
		ElTableColumn,
		ElTag,
		ElIcon,
		ElButton,
		ElDropdown,
		ElDropdownMenu,
		ElDropdownItem,
		ArrowDown,
	},
	data() {
		return {
			fromTime: 'last_week',
			topicMap: {
				'club': '社团',
				'history': '历史',
				'common': '常识'
			},
			wrongCountList: [],
			relatedLinks: []
		};
	},
	mounted() {
		this.analyzeQuizReview(this.fromTime);
	},
	watch: {
		fromTime(newVal) {
			this.analyzeQuizReview(newVal); // fromTime 改变后，重新加载组件
		}
	},
	methods: {
		analyzeQuizReview(fromTime) {
			analyzeQuizReview(fromTime).then((data) => {
				if (data.code === 200) {
					this.wrongCountList = data.object.wrongCountList;
					this.relatedLinks = data.object.relatedLinks;
				}
			}).catch((err) => {
				console.error(err);
			});
		},
		changeFromTime(fromTime) {
			this.fromTime = fromTime;
		},
		getTagType(topic) {
			switch (topic) {
			case 'common':
				return 'warning'; // 黄色
			case 'history':
				return 'primary'; // 默认蓝色
			case 'club':
				return 'success'; // 绿色
			default:
				return 'info'; // 灰色
			}
		},
		headerCellStyle() {
			return {
				fontWeight: 'bold',
				fontSize: '16px',
				backgroundColor: '#1989fa',
				color: '#fff'
			};
		}
	}
};
</script>


<template>
  <div class="review-container">

    <el-row class="wrong-quiz-title-row">
      <el-col :span="18">
        <div class="review-title">错题集合</div>
      </el-col>

      <el-col :span="6">
        <el-dropdown>
          <el-button type="primary">
            日期
            <el-icon class="el-icon--right">
              <arrow-down/>
            </el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="changeFromTime('today')">今天</el-dropdown-item>
              <el-dropdown-item @click="changeFromTime('last_week')">近一周</el-dropdown-item>
              <el-dropdown-item @click="changeFromTime('last_month')">近一月</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-col>
    </el-row>

    <el-row>
      <el-table :data="wrongCountList" class="wrong-table" style="width: 100%" max-height="290"
                :header-cell-style="headerCellStyle">
        <el-table-column prop="quiz.question" label="问题" width="300"/>
        <el-table-column prop="quiz.answer" label="正确答案" width="200"/>
        <el-table-column label="主题" width="100">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.quiz.topic)" disable-transitions>
              {{ topicMap[scope.row.quiz.topic] }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="wrongCount" label="错误次数" width="100"/>
      </el-table>
    </el-row>

    <el-row class="recommend-link-row">
      <div class="review-title">推荐学习内容</div>
    </el-row>

    <el-row>
      <el-table :data="relatedLinks" style="width: 100%" class="related-links-table" :show-header="false"
                :row-border="false">

        <el-table-column label="Topic" width="100">
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.topic)" disable-transitions>
              {{ topicMap[scope.row.topic] }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Title" width="600">
          <template v-slot="{ row }">
            <a :href="row.link" target="_blank">{{ row.title }}</a>
          </template>
        </el-table-column>
      </el-table>
    </el-row>

  </div>
</template>


<style scoped>
.review-container {
  margin: 30px;
  padding: 10px;
  border-radius: 8px;
  margin-top: 0%;
}


.el-row {
  margin: 10px;
}

.wrong-quiz-title-row {
  margin-bottom: 20px;
}

.recommend-link-row {
  margin-top: 20px;
  margin-bottom: 10px;
}

.review-title {
  font-size: x-large;
  font-weight: bold;
}

.related-links-table {
  font-size: 20px;
}

.wrong-table {
  overflow-y: scroll;
}

</style>