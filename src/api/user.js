import request from "@/api/index";

/**
 * 登陆<br/>
 * 返回的 res.data.object 为 {
 *   username:
 *   token:
 *   tokenExpireTime:
 * }
 * @param {string} username
 * @param {string} password
 * */
export function logIn(username, password){
	const data = {
		username: username,
		password: password,
	};
	return request({
		url: '/user-service/log-in',
		method: 'post',
		data: data,
	});
}

// 注册
export function signUp(username, password, email) {
	const data = {
		username: username,
		password: password,
		email: email,
	};
	return request({
		url: '/user-service/sign-up',
		method: 'post',
		data: data,
	});
}

// 退出登陆
export function logOut() {
	return request({
		url: '/user-service/log-out',
		method: 'post'
	});
}

// 获取用户详细信息
/**
 * object: {
 *   username: String
 *   email: String
 *   selfImage: String
 * }
 * */
export function getUserInfo() {
	return request({
		url: '/user-service/get-user-info',
		method: 'get'
	});
}

// 修改个人信息（不包括密码）
export function modifyUserInfo(username, email, selfImage) {
	const data = {
		username: username,
		email: email,
		selfImage: selfImage,
	};
	return request({
		url: '/user-service/modify-user-info',
		method: 'post',
		data: data,
	});
}

// 修改密码
export function modifyPassword(oldPassword, newPassword) {
	const data = {
		oldPassword: oldPassword,
		newPassword: newPassword,
	};
	return request({
		url: '/user-service/modify-user-password',
		method: 'post',
		data: data,
	});
}
