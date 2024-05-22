<script>
import {
	ElRow, ElCol, ElIcon, ElButton, ElTable, ElTableColumn,
	ElDropdown, ElDropdownMenu, ElDropdownItem, ElTag
} from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
import { getAllQuizRecord, getQuizRecordByTimeFilter } from '@/api/quiz';

export default {
	name: 'QuizRecord',
	components: {
		ElRow,
		ElCol,
		ElIcon,
		ElButton,
		ElTable,
		ElTableColumn,
		ElDropdown,
		ElDropdownMenu,
		ElDropdownItem,
		ArrowDown,
		ElTag
	},
	data() {
		return {
			records: [],
			topicMap: {
				'club': '社团',
				'history': '历史',
				'common': '常识'
			}
		};
	},
	mounted() {
		this.getAllQuizRecord();
	},
	methods: {
		getAllQuizRecord() {
			getAllQuizRecord().then((data) => {
				if (data.code === 200) {
					this.records = this.sortByCreateTimestampDescending(data.object);
				}
			}).catch((err) => {
				console.error(err);
			});
		},
		getQuizRecordByTimeFilter(fromTime) {
			getQuizRecordByTimeFilter(fromTime).then((data) => {
				if (data.code === 200) {
					this.records = this.sortByCreateTimestampDescending(data.object);
				}
			}).catch((err) => {
				console.error(err);
			});
		},
		sortByCreateTimestampDescending(records) {
			return records.sort((a, b) => {
				const dateA = new Date(a.createTimestamp);
				const dateB = new Date(b.createTimestamp);
				return dateB - dateA;
			});
		},
		getTopicName(topic) {
			return this.topicMap[topic] || '未知';
		},
		formatDate(timestamp) {
			const date = new Date(timestamp);
			return date.toLocaleString();
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
	},
};
</script>

<template>
  <div class="quiz-record">
    <el-row class="title-row">
      <el-col :span="18">
        <div class="title">历史答题记录</div>
      </el-col>

      <el-col :span="6">
        <el-dropdown>
          <el-button type="primary">
            日期<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="getAllQuizRecord()">所有</el-dropdown-item>
              <el-dropdown-item @click="getQuizRecordByTimeFilter('today')">今天</el-dropdown-item>
              <el-dropdown-item @click="getQuizRecordByTimeFilter('last_week')">近一周</el-dropdown-item>
              <el-dropdown-item @click="getQuizRecordByTimeFilter('last_month')">近一月</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-col>
    </el-row>

    <el-row>
      <el-table :data="records" class="record-table" v-if="records.length > 0" style="width: 100%"
                :header-cell-style="headerCellStyle">
        <el-table-column label="ID" width="40">
          <template v-slot:default="scope">
            {{ scope.$index + 1 }}
          </template>
        </el-table-column>
        <el-table-column label="主题" width="70">
          <template v-slot="{ row }">
            <el-tag :type="getTagType(row.quiz.topic)" disable-transitions>
              {{ getTopicName(row.quiz.topic) }}
            </el-tag>
          </template>

        </el-table-column>
        <el-table-column label="问题" width="300">
          <template v-slot="{ row }">
            {{ row.quiz.question }}
          </template>
        </el-table-column>
        <el-table-column label="回答" width="150">
          <template v-slot="{ row }">
            {{ row.answer }}
          </template>
        </el-table-column>
        <el-table-column label="是否正确" width="90">
          <template v-slot="{ row }">
            {{ row.isCorrect ? '正确' : '错误' }}
          </template>
        </el-table-column>
        <el-table-column label="时间" width="90">
          <template v-slot="{ row }">
            {{ formatDate(row.createTimestamp) }}
          </template>
        </el-table-column>
      </el-table>

      <div v-else class="no-record">暂无历史做题记录</div>
    </el-row>

  </div>
</template>


<style scoped>
.quiz-record {
  width: 100%;
}

.el-row {
  margin-left: 20px;
  margin-bottom: 10px;
}

.title-row {
  margin-bottom: 20px;
}

.title {
  font-size: x-large;
  font-weight: bold;
}
</style>