import {chatService as request} from "@/api/index";

export function getUserInfo() {
	return request({
		url: '/message-service/get-history-message',
		method: 'get'
	});
}
