function checkUsername(username) {
	if (username == null || username === '') {
		return {
			pass: false,
			msg: '用户名不能为空'
		};
	}
	if (username.length < 3) {
		return {
			pass: false,
			msg: '用户名长度至少为3'
		};
	}
	if (username.length > 10) {
		return {
			pass: false,
			msg: '用户名长度不能超过10'
		};
	}
	return {
		pass: true,
		msg: ''
	};
}

function checkPassword(password) {
	if (password == null || password === '') {
		return {
			pass: false,
			msg: '密码不能为空'
		};
	}
	if (password.length < 5) {
		return {
			pass: false,
			msg: '密码长度至少为5'
		};
	}
	if (password.length > 15) {
		return {
			pass: false,
			msg: '密码长度不能超过15'
		};
	}
	return {
		pass: true,
		msg: ''
	};
}

function checkEmail(email) {
	if (email == null || email === '') {
		return {
			pass: false,
			msg: '邮箱不能为空'
		};
	}
	if (email.length > 30) {
		return {
			pass: false,
			msg: '邮箱长度不能超过30'
		};
	}
	const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!regex.test(email)) {
		return { pass: false, msg: '无效的邮箱地址' };
	}
	return {
		pass: true,
		msg: ''
	};
}

export { checkUsername, checkPassword, checkEmail};