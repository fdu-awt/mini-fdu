<script>
import * as echarts from 'echarts';
import {
	ElRow, ElCol, ElIcon, ElStatistic, ElButton, ElDropdown, ElDropdownMenu, ElDropdownItem} from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';

import {
	analyzeQuizAccuracy,
	analyzeQuizTopicDistribution,
	analyzeQuizTimeDistribution,
} from '@/api/quiz';

export default {
	name: 'QuizAnalysis',
	components: {
		ElRow,
		ElCol,
		ElIcon,
		ElStatistic,
		ElButton,
		ElDropdown,
		ElDropdownMenu,
		ElDropdownItem,
		ArrowDown
	},
	data() {
		return {
			fromTime: 'last_week',
			topicMap: {
				'club': '社团',
				'history': '历史',
				'common': '常识'
			},
			quizAccuracy: {},
			quizTopicDistribution: [],
			quizTimeDistribution: [],
		};
	},
	mounted() {
		this.loadDataAndInitCharts(this.fromTime);
	},
	watch: {
		fromTime(newVal) {
			this.loadDataAndInitCharts(newVal); // fromTime 改变后，重新加载组件
		}
	},
	computed: {
		correctRate() {
			if (this.quizAccuracy.totalCount === 0) {
				return 0;
			}
			return (this.quizAccuracy.correctCount / this.quizAccuracy.totalCount * 100).toFixed(2);
		}
	},
	methods: {
		loadDataAndInitCharts(fromTime) {
			this.fetchData(fromTime)
				.then(() => {
					this.initCharts();  // 成功获取数据后，初始化图表
				})
				.catch(error => {
					console.error("Error fetching data: ", error);
				});
		},
		fetchData(fromTime) {
			return Promise.all([
				this.analyzeQuizAccuracy(fromTime),
				this.analyzeQuizTopicDistribution(fromTime),
				this.analyzeQuizTimeDistribution(fromTime),
			]);
		},
		initCharts() {
			this.initTopicDistributionChart();
			this.initTimeDistributionChart();
		},
		changeFromTime(fromTime) {
			this.fromTime = fromTime;
		},
		analyzeQuizAccuracy(fromTime) {
			return analyzeQuizAccuracy(fromTime).then((data) => {
				if (data.code === 200) {
					this.quizAccuracy = data.object;
				}
			}).catch((err) => {
				console.error(err);
			});
		},
		analyzeQuizTopicDistribution(fromTime) {
			return analyzeQuizTopicDistribution(fromTime).then((data) => {
				if (data.code === 200) {
					this.quizTopicDistribution = data.object;
				}
			}).catch((err) => {
				console.error(err);
			});
		},
		analyzeQuizTimeDistribution(fromTime) {
			return analyzeQuizTimeDistribution(fromTime).then((data) => {
				if (data.code === 200) {
					this.quizTimeDistribution = data.object.sort((a, b) => new Date(a.date) - new Date(b.date));
				}
			}).catch((err) => {
				console.error(err);
			});
		},
		initTopicDistributionChart() {
			const topicDistributionChart = echarts.init(this.$refs.topicDistributionChart);

			const data = this.quizTopicDistribution.map(item => ({
				name: this.topicMap[item.topic],
				value: item.totalCount
			}));

			const topicDistributionOption = {
				title: {
					text: '答题类别分布',
					left: 'center'
				},
				legend: {
					orient: 'vertical',
					left: 'left',
					data: this.quizTopicDistribution.map(item => this.topicMap[item.topic])
				},
				series: [{
					name: '类别',
					type: 'pie',
					radius: ['50%', '70%'], // 设置半径，创建环形图
					avoidLabelOverlap: false,
					label: {
						show: false,
						position: 'center'
					},
					emphasis: {
						label: {
							show: true,
							fontSize: '30',
							fontWeight: 'bold'
						}
					},
					labelLine: {
						show: false
					},
					data: data,
					itemStyle: {
						color: function (params) {
							const colorList = ['#c0e6dd', '#eec2a1', '#d1d3eb'];
							return colorList[params.dataIndex % colorList.length];
						}
					}
				}]
			};

			topicDistributionChart.setOption(topicDistributionOption);
		},
		initTimeDistributionChart() {
			const timeDistributionChart = echarts.init(this.$refs.timeDistributionChart);

			const timeDistributionOption = {
				title: {
					text: '答题时间分布',
					left: 'center'
				},
				legend: {
					data: ['答题数'],
					left: 'right'
				},
				xAxis: {
					type: 'category',
					data: this.quizTimeDistribution.map(item => item.date)
				},
				yAxis: {
					type: 'value'
				},
				series: [{
					name: '答题数',
					data: this.quizTimeDistribution.map(item => item.totalCount),
					type: 'bar',
					itemStyle: {
						color: '#a1d1ee',
						borderRadius: [4, 4, 0, 0] // 设置柱子的圆角，分别对应左上、右上、右下、左下
					}
				}],

			};

			timeDistributionChart.setOption(timeDistributionOption);
		}
	}
};
</script>

<template>
  <div class="analysis-container">
    <el-row :gutter="20" class="analysis-all">
      <!-- 做题情况概览 -->
      <el-col :span="6">
        <el-statistic :value="quizAccuracy.correctCount" :value-style="{ color: '#409eff' }">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              答题情况
            </div>
          </template>
          <template #suffix>/{{ quizAccuracy.totalCount }}</template>
        </el-statistic>
      </el-col>
      <el-col :span="6">
        <el-statistic title="正确率" :value="correctRate" :suffix="'%'" />
      </el-col>
      <!-- <el-col :span="6">
          <el-statistic title="排名" :value="2" />
      </el-col> -->
      <el-col :span="6">
        <el-statistic :value="quizAccuracy.rank" :value-style="{ color: '#409eff' }">
          <template #title>
            <div style="display: inline-flex; align-items: center">
              排名
            </div>
          </template>
          <template #suffix>/{{ quizAccuracy.userNum }}</template>
        </el-statistic>
      </el-col>
      <!-- 选择时间 -->
      <el-col :span="6">
        <el-dropdown>
          <el-button type="primary">
            日期<el-icon class="el-icon--right"><arrow-down /></el-icon>
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

    <el-row :gutter="20" class="chart-row">
      <!-- 答题类别分布 -->
      <el-col :span="12">
        <div class="chart-container">
          <div ref="topicDistributionChart" class="topic-distribution-chart"></div>
        </div>
      </el-col>
      <!-- 答题时间分布 -->
      <el-col :span="12">
        <div class="chart-container">
          <div ref="timeDistributionChart" class="time-distribution-chart"></div>
        </div>
      </el-col>
    </el-row>

  </div>
</template>


<style scoped>
.analysis-container {
  margin: 10px;
  padding: 10px;
  border-radius: 8px;
}

.analysis-all {
  margin-top: -20px;
}

.el-row {
  justify-content: center;
  padding: 30px;
}

.chart-container {
  height: 400px;
}

.topic-distribution-chart,
.time-distribution-chart {
  height: 100%;
}

.chart-row {
  margin-bottom: 0px;
}
</style>