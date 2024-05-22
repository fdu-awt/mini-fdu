<script>
import { ElCard, ElRow, ElCol, ElMessage } from 'element-plus';
import { Select, CloseBold } from '@element-plus/icons-vue';
import { getRandomQuizQuestion, submitAnswer } from '@/api/quiz';

export default {
	name: 'QuizQuestion',
	components: {
		ElCard,
		ElRow,
		ElCol,
		Select,
		CloseBold
	},
	data() {
		return {
			quizId: null,
			question: '',
			options: [],
			selectedOption: null,  // 用户选择的答案
			correctOption: null    // 正确答案
		};
	},
	mounted() {
		this.getRandomQuizQuestion();
	},
	methods: {
		getRandomQuizQuestion() {
			getRandomQuizQuestion().then((data) => {
				if (data.code === 200) {
					this.quizId = data.object.id;
					this.question = data.object.question;
					this.options = data.object.options.split('|').map(option => option.trim());
				}
			}).catch((err) => {
				console.error(err);
			});
		},
		selectOption(option) {
			if (this.selectedOption !== null) {
				ElMessage({
					showClose: true,
					message: "请勿重复作答",
					type: "error"
				});
				return;
			}

			submitAnswer(this.quizId, option).then((data) => {
				if (data.code === 200) {
					this.selectedOption = option;
					this.correctOption = data.object.rightAnswer;
				}
			}).catch((err) => {
				console.error(err);
			});
		},
		getNextQuestion() {
			this.selectedOption = null;
			this.correctOption = null;
			this.getRandomQuizQuestion();
		}
	}
};
</script>

<template>
  <div class="quiz-question">
    <div class="question-card card-header">
      <h2>问题：{{ question }}</h2>
    </div>

    <el-row :gutter="20" class="options-row">
      <el-col :span="24" v-for="option in options" :key="option" class="option-col">
        <el-card class="option-card" @click="selectOption(option)">
          <div class="option-wrapper">
            <div class="option-content">
              {{ option }}
            </div>
            <div class="option-feedback">
              <Select v-if="option === selectedOption && option === correctOption" class="feedback-icon correct-feedback" />
              <CloseBold v-else-if="option === selectedOption && option !== correctOption" class="feedback-icon incorrect-feedback" />
              <Select v-else-if="option === correctOption" class="feedback-icon correct-feedback" />
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div>
      <button @click="getNextQuestion()" class="next-button">下一题</button>
    </div>
  </div>
</template>


<style scoped>
.quiz-question {
  max-width: 600px;
  margin: 20px auto;
  position: relative;
  justify-content: center;
  align-items: center;
  padding-top: 40px;
}

.card-header {
  display: flex;
  justify-content: center;
  align-items: center;
}

.question-card {
  margin-bottom: 40px;
  font-size: 1em;
  color: #2e2e2e;
  font-weight: 700;
}

.option-row {
  margin-bottom: 20px;
}

.option-col {
  margin-bottom: 30px;
}

.option-card {
  margin-left: 5%;
  margin-right: 5%;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;
  padding: 10px;
  border: 1px solid transparent;
  background-color: #e0e2f3;
  color: #2e2e2e;
  font-weight: 600;
  font-size: 1.2em;
}

.option-card:hover {
  background-color: #e6e8f4;
  transform: scale(1.05);
  border-color: #dcdcdc;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.option-content {
  padding: 5px;
  text-align: center;
}

.correct-feedback {
  color: green;
}

.incorrect-feedback {
  color: red;
}

.feedback-icon {
  width: 30px;
  height: 30px;
}

.option-wrapper {
  display: flex;
  align-items: center;
}

.option-content {
  flex: 1;
}

.feedback-icon {
  margin-left: 10px;
}

.next-button-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.next-button {
  width: 20%;
  border: 2px solid var(--primary-color);
  background-color: var(--primary-color-2);
  height: 40px;
  color: white;
  font-size: .8em;
  font-weight: 500;
  letter-spacing: 1px;
  border-radius: 30px;
  margin: 10px;
  cursor: pointer;
  overflow: hidden;
  margin-left: 220px;
  align-content: center;
}

.next-button::after {
  content: "";
  position: absolute;
  background-color: rgba(255, 255, 255, 0.253);
  height: 100%;
  width: 150px;
  top: 0;
  left: -200px;
  border-bottom-right-radius: 100px;
  border-top-left-radius: 100px;
  filter: blur(10px);
  transition-duration: .5s;
}

/* .next-button:hover::after {
    transform: translateX(600px);
    transition-duration: .5s;
} */
</style>