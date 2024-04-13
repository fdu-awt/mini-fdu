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
  if (password.length > 10) {
    return {
      pass: false,
      msg: '密码长度不能超过10'
    };
  }
  return {
    pass: true,
    msg: ''
  };
}

export { checkUsername, checkPassword };