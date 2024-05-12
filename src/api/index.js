import axios from 'axios';
import {requestFulfilled, requestRejected, responseFulfilled, responseRejected} from "@/api/interceptor";
import { ElMessage, ElNotification } from 'element-plus';
import apiEmitter, {API_EVENTS} from "@/event/ApiEventEmitter";

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

// 请求错误的全局事件处理器
apiEmitter.on(API_EVENTS.INTERNAL_ERROR, (msg) => {
	console.error("请求错误的全局事件处理器，INTERNAL_ERROR：", msg);
	ElMessage({
		showClose: true,
		message: msg,
		type: "error",
	});
});
apiEmitter.on(API_EVENTS.OTHER_ERROR, (msg) => {
	console.error("请求错误的全局事件处理器，OTHER_ERROR：", msg);
	ElNotification({
		title: msg,
		type: 'error',
	});
});
apiEmitter.on(API_EVENTS.NETWORK_ERROR, (msg) => {
	console.error("请求错误的全局事件处理器，NETWORK_ERROR：", msg);
	ElNotification({
		title: msg,
		type: 'error',
	});
});

export {userService, chatService, studyService, AIService};