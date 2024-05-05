import axios from 'axios';
import {requestFulfilled, requestRejected, responseFulfilled, responseRejected} from "@/api/interceptor";

const userService = axios.create({
	baseURL: process.env.VUE_APP_USER_BASE_URL,
	timeout: 20000, // 超时设置为20秒
	headers: {
		'Content-Type': 'application/json;charset=utf-8',
	},
});

const chatService = axios.create({
	baseURL: process.env.VUE_APP_CHAT_BASE_URL,
	timeout: 20000, // 超时设置为20秒
	headers: {
		'Content-Type': 'application/json;charset=utf-8',
	},
});

const studyService = axios.create({
	baseURL: process.env.VUE_APP_STUDY_BASE_URL,
	timeout: 20000, // 超时设置为20秒
	headers: {
		'Content-Type': 'application/json;charset=utf-8',
	},
});

const AIService = axios.create({
	baseURL: process.env.VUE_APP_AI_BASE_URL,
	timeout: 20000, // 超时设置为20秒
	headers: {
		'Content-Type': 'application/json;charset=utf-8',
	},
});

const services = [userService, chatService, studyService, AIService];

services.forEach(service => {
	// 请求拦截器
	service.interceptors.request.use(
		requestFulfilled, requestRejected
	);
	// 响应拦截器
	service.interceptors.response.use(
		responseFulfilled, responseRejected
	);
});

export {userService, chatService, studyService, AIService};