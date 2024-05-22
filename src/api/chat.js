import {chatService as request} from "@/api/index";

export function getMessageInfo(localId, remoteId) {
	return request({
		url: '/message-service/get-history-message',
		method: 'get',
		params: {
			localId,
			remoteId
		}
	});
}
