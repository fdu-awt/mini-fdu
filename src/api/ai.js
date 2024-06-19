import {AIService as request} from "@/api/index";

// AI问答
export function chatWithAI(question, intro, history) {
	const data = {
		question: question,
		intro: intro,
		history: history,
	};
	return request({
		url: '/AI-service/chat-with-AI',
		method: 'post',
		data: data,
	});
}