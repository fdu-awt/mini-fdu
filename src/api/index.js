import axios from 'axios';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import router from "@/router";
import STORAGE from "@/store";

const service = axios.create({
	baseURL: process.env.VUE_APP_BASE_URL,
	timeout: 20000, // 超时设置为20秒
	headers: {
		'Content-Type': 'application/json;charset=utf-8',
	},
});

// request拦截器
service.interceptors.request.use(
	config => {
		// 是否需要设置 token
		const isToken = (config.headers || {}).isToken === false;
		const token = STORAGE.getToken();
		if (token && !isToken) {
			config.headers["Authorization"] = "Bearer " + token;
		}
		// get请求映射params参数
		if (config.method === "get" && config.params) {
			let url = config.url + "?";
			for (const propName of Object.keys(config.params)) {
				const value = config.params[propName];
				const part = encodeURIComponent(propName) + "=";
				if (value !== null && typeof value !== "undefined") {
					if (typeof value === "object") {
						for (const key of Object.keys(value)) {
							let params = propName + "[" + key + "]";
							const subPart = encodeURIComponent(params) + "=";
							url += subPart + encodeURIComponent(value[key]) + "&";
						}
					} else {
						url += part + encodeURIComponent(value) + "&";
					}
				}
			}
			url = url.slice(0, -1);
			config.params = {};
			config.url = url;
		}
		return config;
	},
	error => {
		console.error(error);
		Promise.reject(error).then(r => console.error(r));
	}
);

// 响应拦截器
service.interceptors.response.use(
	res => {
		// 未设置状态码则默认 服务器内部错误
		const code = res.data.code || 500;
		// 获取错误信息
		const msg = res.data.msg;
		if (code === 401) {
			// 未授权
			ElMessageBox.alert('您需要登录以访问这个页面。', '未授权访问', {
				confirmButtonText: '前往登录',
				type: 'warning'
			}).then(() => {
				STORAGE.logOut();
				router.push({
					path: '/login',
					query: { redirect: router.currentRoute.value.fullPath }
				}).then();
			});
			return Promise.reject(new Error(msg));
		} else if (code === 500) {
			// 服务器内部错误
			ElMessage({
				showClose: true,
				message: msg,
				type: "error",
			});
			return Promise.reject(new Error(msg));
		} else if (code !== 200) {
			// 请求失败
			ElNotification({
				title: msg,
				type: 'error',
			});
			return Promise.reject(new Error(msg));
		} else {
			// code = 200 时
			if (res.data.uxApi) {
				if (res.data.success) {
					return res.data;
				} else {
					ElNotification({
						title: msg,
						type: 'error'
					});
					console.error(res);
					return Promise.reject(res);
				}
			} else {
				return res.data;
			}
		}
	},
	error => {
		console.error("err: " + error);
		let { message } = error;
		if (message.includes("Network Error")) {
			message = "后端连接异常";
		} else if (message.includes("timeout")) {
			message = "请求超时";
		} else if (message.includes("Request failed with status code")) {
			message = "请求异常：" +
				message.substr(message.length - 3);
		}
		ElNotification({
			title: message,
			type: 'error',
		});
		return Promise.reject(error);
	}
);

export default service;