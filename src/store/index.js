// 实现一：使用localStorage
// 令牌将在浏览器会话之间持久保存，直到明确地清除它。
// 这意味着用户刷新页面或关闭浏览器时，令牌仍然存在。

const USER_KEY = 'user';
const SELF_IMAGE_KEY = 'selfImage';

const STORAGE = {
	getUser() {
		const user = window.localStorage.getItem(USER_KEY);
		return user ? JSON.parse(user) : {
			user: {
				username: '',
				token: '',
				tokenExpireTime: '',
			}};
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
	loginSuccess(user) {
		window.localStorage.setItem(USER_KEY, JSON.stringify(user));
	},
	logOut() {
		window.localStorage.removeItem(USER_KEY);
		window.localStorage.removeItem(SELF_IMAGE_KEY);
	},
	getSelfImage() {
		return window.localStorage.getItem(SELF_IMAGE_KEY) || '';
	},
	setSelfImage(selfImage) {
		window.localStorage.setItem(SELF_IMAGE_KEY, selfImage);
	}

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
