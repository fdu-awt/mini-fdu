import { studyService as request } from "@/api/index";

// 获取复旦校史数据
export function getAllHistoryData(){
	return request({
		url: '/study-service/get-all-history-data',
		method: 'get'
	});
}

// 获取社团数据
export function getAllClubData(){
	return request({
		url: '/study-service/get-all-club-data',
		method: 'get'
	});
}