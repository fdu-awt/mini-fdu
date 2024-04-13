// 实现一：使用localStorage
// 令牌将在浏览器会话之间持久保存，直到明确地清除它。
// 这意味着用户刷新页面或关闭浏览器时，令牌仍然存在。

function getUser() {
	const user = window.localStorage.getItem('user');
	return user ? JSON.parse(user) : {
		user: {
			username: '',
			token: '',
		}};
}

function getToken() {
	return getUser().token;
}

function loginSuccess(username, token) {
	const data = {
		username: username,
		token: token,
	};
	window.localStorage.setItem('user', JSON.stringify(data));
}

function logOut() {
	window.localStorage.removeItem('user');
}

export { getUser, getToken, loginSuccess, logOut };

// 实现二：使用sessionStorage
// 令牌在用户关闭浏览器窗口或标签页后会自动清除
// function getToken() {
// 	return sessionStorage.getItem('token');
// }
//
// function loginSuccess(token) {
// 	sessionStorage.setItem('token', token);
// }
