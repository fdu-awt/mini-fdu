import {AIService as request} from "@/api/index";

// AI问答
export function chatWithAI(question, history) {
	const data = {
		question: question,
		history: history,
	};
	return request({
		url: '/AI-service/chat-with-AI',
		method: 'post',
		data: data,
	});
}