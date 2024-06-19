// 实现一：使用localStorage
// 令牌将在浏览器会话之间持久保存，直到明确地清除它。
// 这意味着用户刷新页面或关闭浏览器时，令牌仍然存在。

import SELF_IMAGE from "@/three/self-image/self-image";

const USER_KEY = 'user';
const SELF_IMAGE_KEY = 'selfImage';
const AI_HISTORY_KEY = 'history_message';

const STORAGE = {
	getUser() {
		const user = window.localStorage.getItem(USER_KEY);
		return user ? JSON.parse(user) : {
			id: '',
			username: '',
			token: '',
			tokenExpireTime: '',
		};
	},
	getUserId() {
		return STORAGE.getUser().id;
	},
	getUsername() {
		return STORAGE.getUser().username;
	},
	setUsername(username) {
		const user = STORAGE.getUser();
		user.username = username;
		window.localStorage.setItem(USER_KEY, JSON.stringify(user));
	},
	setUserId(userId){
		const user = STORAGE.getUser();
		console.log("user",user);
		user.id = userId;
		window.localStorage.setItem(USER_KEY, JSON.stringify(user));
	},
	getToken() {
		return STORAGE.getUser().token;
	},
	getTokenExpireTime() {
		return STORAGE.getUser().tokenExpireTime;
	},
	isTokenExpired() {
		const tokenExpireTime = STORAGE.getTokenExpireTime();
		if (!tokenExpireTime) {
			return true;
		}
		const expireTime = new Date(tokenExpireTime);
		const timeNow = new Date();
		return timeNow.getTime() > expireTime.getTime();
	},
	loginSuccess(userId, username, token, tokenExpireTime) {
		const user = {
			id: userId,
			username: username,
			token: token,
			tokenExpireTime: tokenExpireTime,
		};
		window.localStorage.setItem(USER_KEY, JSON.stringify(user));
	},
	logOut() {
		window.localStorage.removeItem(USER_KEY);
		window.localStorage.removeItem(SELF_IMAGE_KEY);
		window.localStorage.removeItem(AI_HISTORY_KEY);
	},
	getSelfImage() {
		let selfImage = window.localStorage.getItem(SELF_IMAGE_KEY);
		if (!selfImage) {
			selfImage = SELF_IMAGE.defaultModelName;
			this.setSelfImage(selfImage);
		}
		return selfImage;
	},
	setSelfImage(selfImage) {
		window.localStorage.setItem(SELF_IMAGE_KEY, selfImage);
	},
	// 获取历史聊天数据
	getAIHistory() {
		const history = window.localStorage.getItem(AI_HISTORY_KEY);
		return history ? JSON.parse(history) : [];
	},
	// 添加一条新的聊天数据到历史记录
	addAIHistoryMessage(message) {
		let currentHistory = this.getAIHistory();
		currentHistory.push(message); // 添加新消息到历史记录数组
		window.localStorage.setItem(AI_HISTORY_KEY, JSON.stringify(currentHistory));
	},
	// 清除所有历史聊天数据
	clearAIHistory() {
		window.localStorage.removeItem(AI_HISTORY_KEY);
	},
};

// 实现二：使用sessionStorage
// 令牌在用户关闭浏览器窗口或标签页后会自动清除
// function getToken() {
// 	return sessionStorage.getItem('token');
// }
//
// function loginSuccess(token) {
// 	sessionStorage.setItem('token', token);
// }

export default STORAGE;
