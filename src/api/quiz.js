import {studyService as request} from "@/api/index";
import STORAGE from "@/store";

const userId = STORAGE.getUserId();

// 随机获取一道自测题
export function getRandomQuizQuestion() {
	return request({
		url: '/study-service/get-random-quiz',
		method: 'get'
	});
}

// 记录玩家作答情况，获取作答结果（若错误，显示正确答案）
export function submitAnswer(quizId, answer) {
	const data = {
		userId: userId,
		quizId: quizId,
		answer: answer
	};
	return request({
		url: '/study-service/create-new-quiz-record',
		method: 'post',
		data: data,
	});
}

// 获取用户所有做题记录
export function getAllQuizRecord() {
	return request({
		url: '/study-service/get-all-quiz-record',
		method: 'get',
		params: {
			userId: userId
		}
	});
}

// 获取用户某一时间段的做题记录
export function getQuizRecordByTimeFilter(fromTime) {
	return request({
		url: '/study-service/get-quiz-record-by-time-filter',
		method: 'get',
		params: {
			userId: userId,
			fromTime: fromTime
		}
	});
}

// 分析用户做题正确率
export function analyzeQuizAccuracy(fromTime) {
	return request({
		url: '/study-service/analyze-quiz-accuracy',
		method: 'get',
		params: {
			userId: userId,
			fromTime: fromTime
		}
	});
}

// 分析用户做题类别分布
export function analyzeQuizTopicDistribution(fromTime) {
	return request({
		url: '/study-service/analyze-quiz-topic-distribution',
		method: 'get',
		params: {
			userId: userId,
			fromTime: fromTime
		}
	});
}

// 分析用户做题时间分布
export function analyzeQuizTimeDistribution(fromTime) {
	return request({
		url: '/study-service/analyze-quiz-time-distribution',
		method: 'get',
		params: {
			userId: userId,
			fromTime: fromTime
		}
	});
}

// 分析用户错题复盘
export function analyzeQuizReview(fromTime) {
	return request({
		url: '/study-service/analyze-quiz-review',
		method: 'get',
		params: {
			userId: userId,
			fromTime: fromTime
		}
	});
}