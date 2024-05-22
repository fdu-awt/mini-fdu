import axios from 'axios';
import {requestFulfilled, requestRejected, responseFulfilled, responseRejected} from "@/api/interceptor";
import { ElMessage, ElNotification } from 'element-plus';
import apiErrorEmitter, {API_ERROR_EVENTS} from "@/event/ApiErrorEventEmitter";

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
// 在这里处理，可以只注册一遍
apiErrorEmitter.on(API_ERROR_EVENTS.INTERNAL_ERROR, (msg) => {
	console.error("请求错误的全局事件处理器，INTERNAL_ERROR：", msg);
	ElMessage({
		showClose: true,
		message: msg,
		type: "error",
	});
});
apiErrorEmitter.on(API_ERROR_EVENTS.OTHER_ERROR, (msg) => {
	console.warn("请求错误的全局事件处理器，OTHER_ERROR：", msg);
	ElNotification({
		title: msg,
		type: 'error',
	});
});
apiErrorEmitter.on(API_ERROR_EVENTS.NETWORK_ERROR, (msg) => {
	console.error("请求错误的全局事件处理器，NETWORK_ERROR：", msg);
	ElNotification({
		title: msg,
		type: 'error',
	});
});

export {userService, chatService, studyService, AIService};