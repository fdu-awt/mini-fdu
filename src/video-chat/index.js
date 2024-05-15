if (navigator.mediaDevices === undefined) {
	navigator.mediaDevices = {};
}

// 检查是否存在 getUserMedia
if (!navigator.mediaDevices.getUserMedia) {
	navigator.mediaDevices.getUserMedia = function(params) {
		return new Promise((resolve, reject) => {
			const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

			if (!getUserMedia) {
				reject(new Error('getUserMedia 在此浏览器中未实现'));
			} else {
				getUserMedia.call(navigator, params, resolve, reject);
			}
		});
	};
}

class VideoChat {
	constructor(localVideo, remoteVideo, signalingServerUrl, userId) {
		this.localVideo = localVideo;
		this.remoteVideo = remoteVideo;
		this.signalingServerUrl = signalingServerUrl;
		this.userId = userId;
		this.rtcPeerConnection = null;
		this.ws = null;

		this.handleIceCandidate = this.handleIceCandidate.bind(this);
		this.handleRemoteStream = this.handleRemoteStream.bind(this);
		this.handleSignalingData = this.handleSignalingData.bind(this);
	}

	start() {
		navigator.mediaDevices.getUserMedia({ video: true, audio: true })
			.then(stream => {
				// 处理成功获取用户媒体流的逻辑
				if ('srcObject' in this.localVideo) {
					console.log('srcObject in localVideo');
					this.localVideo.srcObject = stream;
				} else {
					console.log('srcObject not in localVideo');
					this.localVideo.src = window.URL.createObjectURL(stream);
				}
				this.localVideo.play();

				this.rtcPeerConnection = new RTCPeerConnection();
				stream.getTracks().forEach(track => this.rtcPeerConnection.addTrack(track, stream));

				this.rtcPeerConnection.onicecandidate = this.handleIceCandidate;
				this.rtcPeerConnection.ontrack = this.handleRemoteStream;

				const url = `${this.signalingServerUrl}/${this.userId}`;
				this.ws = new WebSocket(url);

				this.ws.addEventListener('open', () => {
					console.log('Connected to the signaling server');
					this.ws.addEventListener('message', this.handleSignalingData);

					this.rtcPeerConnection.createOffer()
						.then(offer => {
							this.rtcPeerConnection.setLocalDescription(offer);
							// 发送 offer 给信令服务器
							this.ws.send(JSON.stringify({ offer: offer }));
						});
				});

				this.ws.addEventListener('close', () => {
					console.log('Disconnected from the signaling server');
				});

				this.ws.addEventListener('error', (err) => {
					console.error(err.name + ': ' + err.message);
				});
			})
			.catch((err) => {
				console.error(err.name + ': ' + err.message);
			});
	}

	handleIceCandidate(event) {
		if (event.candidate && this.ws) {
			// 发送 ICE candidate 给信令服务器
			this.ws.send(JSON.stringify({ type: 'iceCandidate', candidate: event.candidate }));
		}
	}

	handleRemoteStream(event) {
		this.remoteVideo.srcObject = event.streams[0];
	}

	handleSignalingData(event) {
		try {
			const parsedData = JSON.parse(event.data);

			if (parsedData.offer) {
				// 处理来自另一端的 offer
				this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(parsedData.offer))
					.then(() => {
						return this.rtcPeerConnection.createAnswer();
					})
					.then(answer => {
						return this.rtcPeerConnection.setLocalDescription(answer);
					})
					.then(() => {
						// 发送 answer 给信令服务器
						this.ws.send(JSON.stringify({ answer: this.rtcPeerConnection.localDescription }));
					})
					.catch(error => {
						console.error('Failed to handle offer: ', error);
					});
			} else if (parsedData.answer) {
				// 处理来自另一端的 answer
				this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(parsedData.answer))
					.catch(error => {
						console.error('Failed to handle answer: ', error);
					});
			} else if (parsedData.iceCandidate) {
				// 处理来自另一端的 ICE candidates
				this.rtcPeerConnection.addIceCandidate(new RTCIceCandidate(parsedData.iceCandidate))
					.catch(error => {
						console.error('Failed to add ICE Candidate: ', error);
					});
			}
		} catch (error) {
			console.error('Failed to parse signaling data: ', error);
		}
	}
}

export default VideoChat;
