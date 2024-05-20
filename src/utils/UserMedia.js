/**
 * @description 获取用户媒体流
 * @param {Object} constrains - 获取用户媒体流的约束，如视频宽高，消除回音等，例如{ video: true, audio: true }
 * @returns {Promise} 返回一个Promise对象，成功时返回一个MediaStream对象，失败时返回错误信息
 * */
export default function getUserMedia(constrains) {
	if (window.navigator.mediaDevices.getUserMedia) {
		return window.navigator.mediaDevices.getUserMedia(constrains);
	} else if (window.navigator.webkitGetUserMedia) {
		return window.navigator.webkitGetUserMedia(constrains);
	} else if (window.navigator.mozGetUserMedia) {
		return window.navigator.mozGetUserMedia(constrains);
	} else if (window.navigator.getUserMedia) {
		return window.navigator.getUserMedia(constrains);
	}
}
