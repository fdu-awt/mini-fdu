import axios from 'axios';
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import router from "@/router";

const service = axios.create({
	baseURL: process.env.VUE_APP_BASE_URL,
	timeout: 20000, // 超时设置为20秒
	headers: {
		'Content-Type': 'application/json;charset=utf-8',
	},
});

// 响应拦截器
service.interceptors.response.use(
	res => {
		// 未设置状态码则默认 服务器内部错误
		const code = res.data.code || 400;
		// 获取错误信息
		const msg = res.data.msg;
		if (code === 401) {
			// 未授权
			ElMessageBox.alert('您需要登录以访问这个页面。', '未授权访问', {
				confirmButtonText: '前往登录',
				type: 'warning'
			}).then(() => router.push('/login'));
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
			return Promise.reject("error");
		} else {
			// code = 200 时
			if (res.data.uxApi) {
				if (res.data.success) {
					return res.data.result;
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
		console.log("err: " + error);
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