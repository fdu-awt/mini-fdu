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
	console.log(data);
	return new Promise((resolve, reject) => {
		resolve({
			data: {
				object: {
					username: username,
					token: password,
					tokenExpireTime: '2021-12-31 23:59:59',
				},
				code: 200,
				msg: '登陆成功',
			}
		});
		reject('登陆失败');
	});
	// return request({
	// 	url: '/user-service/log-in',
	// 	method: 'post',
	// 	data: data,
	// });
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
export function getUserInfo() {
	return new Promise((resolve, reject) => {
		resolve({
			data: {
				object: {
					username: 'admin',
					email: '3@qq.com',
					selfImage: '/万叶/万叶.pmx',
				},
				code: 200,
				msg: '获取用户信息成功',
			},
		});
		reject('获取用户信息失败');
	});
	// return request({
	// 	url: '/user-service/get-user-info',
	// 	method: 'get'
	// });
}

// 修改个人信息
export function modifyUserInfo(username, password, email, selfImage) {
	const data = {
		username: username,
		password: password,
		email: email,
		selfImage: selfImage,
	};
	return request({
		url: '/user-service/modify-user-info',
		method: 'post',
		data: data,
	});
}
