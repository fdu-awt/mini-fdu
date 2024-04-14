// 实现一：使用localStorage
// 令牌将在浏览器会话之间持久保存，直到明确地清除它。
// 这意味着用户刷新页面或关闭浏览器时，令牌仍然存在。

const USER_KEY = 'user';
const SELF_IMAGE_KEY = 'selfImage';

function getUser() {
	const user = window.localStorage.getItem(USER_KEY);
	return user ? JSON.parse(user) : {
		user: {
			username: '',
			token: '',
			tokenExpireTime: '',
		}};
}

function getToken() {
	return getUser().token;
}

function loginSuccess(user) {
	window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function logOut() {
	window.localStorage.removeItem(USER_KEY);
	window.localStorage.removeItem(SELF_IMAGE_KEY);
}

function getSelfImage() {
	return window.localStorage.getItem(SELF_IMAGE_KEY) || '';
}

function setSelfImage(selfImage) {
	window.localStorage.setItem(SELF_IMAGE_KEY, selfImage);
}

export { getUser, getToken, loginSuccess, logOut, getSelfImage, setSelfImage};

// 实现二：使用sessionStorage
// 令牌在用户关闭浏览器窗口或标签页后会自动清除
// function getToken() {
// 	return sessionStorage.getItem('token');
// }
//
// function loginSuccess(token) {
// 	sessionStorage.setItem('token', token);
// }
